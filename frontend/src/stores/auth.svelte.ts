import type { FidoDevice, KeyData } from '@/types/crypto'
import { ENCRYPTION_CONFIG } from '@/consts/encryption'
import * as fidoService from '@/services/fido'
import { PasswordGenerator } from '@/utils/password-generator'
import { equals } from '@/utils/uin8array'

class Auth {
  #masterKey: Uint8Array | null = null
  #setMasterKey(masterKey: Uint8Array) {
    if (this.#masterKey) {
      this.#masterKey.fill(0)
    }

    this.#masterKey = new Uint8Array(masterKey)
  }

  #keyData: KeyData | null = null
  #setKeyData(keyData: KeyData) {
    this.#keyData = keyData
    this.#updateFidoDevicesList()
  }

  #updateFidoDevicesList() {
    this.fidoDevicesList = this.#keyData?.fido?.devices?.map(d => ({ ...d })) ?? []
  }

  get keyData(): KeyData {
    const base: KeyData = {
      password: {
        salt: this.#keyData!.password.salt.slice(),
        iv: this.#keyData!.password.iv.slice(),
        value: this.#keyData!.password.value.slice(),
      },
      recovery: {
        salt: this.#keyData!.recovery.salt.slice(),
        iv: this.#keyData!.recovery.iv.slice(),
        value: this.#keyData!.recovery.value.slice(),
      },
    }
    if (this.#keyData!.fido) {
      base.fido = {
        devices: this.#keyData!.fido.devices.map(d => ({
          ...d,
          value: d.value.slice(),
        })),
      }
    }
    return base
  }

  get fidoDevices(): FidoDevice[] {
    return this.#keyData?.fido?.devices ?? []
  }

  // 用于 UI 响应式的 FIDO 设备列表
  fidoDevicesList = $state<FidoDevice[]>([])

  isAuthed = $state(false)
  isRecoveryEnabled = $state(false)

  #mustAuthed(): void {
    if (!this.#masterKey) {
      throw new Error('locked')
    }
  }

  async #deriveKey(password: string, salt: Uint8Array, usage: Extract<KeyUsage, 'encrypt' | 'decrypt'>) {
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      'PBKDF2',
      false,
      ['deriveKey'],
    )

    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt.slice(),
        iterations: ENCRYPTION_CONFIG.iterations,
        hash: ENCRYPTION_CONFIG.hash,
      },
      keyMaterial,
      {
        name: ENCRYPTION_CONFIG.algorithm,
        length: ENCRYPTION_CONFIG.keyLength,
      },
      false,
      [usage],
    )

    return derivedKey
  }

  async #decrypt(password: string, salt: Uint8Array, iv: Uint8Array, encrypted: Uint8Array) {
    const derivedKey = await this.#deriveKey(password, salt, 'decrypt')

    const decrypted = await crypto.subtle.decrypt(
      { name: ENCRYPTION_CONFIG.algorithm, iv: iv.slice() },
      derivedKey,
      encrypted.slice(),
    )

    return new Uint8Array(decrypted)
  }

  async #encrypt(password: string, salt: Uint8Array, iv: Uint8Array, data: Uint8Array) {
    const derivedKey = await this.#deriveKey(password, salt, 'encrypt')

    const encrypted = await crypto.subtle.encrypt(
      { name: ENCRYPTION_CONFIG.algorithm, iv: iv.slice() },
      derivedKey,
      data.slice(),
    )

    return new Uint8Array(encrypted)
  }

  async auth(password: string, keyData: KeyData) {
    const masterKey = await this.#decrypt(
      password,
      keyData.password.salt,
      keyData.password.iv,
      keyData.password.value,
    )
    this.#setMasterKey(masterKey)
    this.#setKeyData(keyData)
    this.isAuthed = true

    if (keyData.recovery.value.some(b => b !== 0)) {
      this.isRecoveryEnabled = true
    }
  }

  async decryptMasterKey(password: string, keyData: KeyData): Promise<Uint8Array> {
    return this.#decrypt(
      password,
      keyData.password.salt,
      keyData.password.iv,
      keyData.password.value,
    )
  }

  authWithMasterKey(masterKey: Uint8Array, keyData: KeyData) {
    this.#setMasterKey(masterKey)
    this.#setKeyData(keyData)
    this.isAuthed = true

    if (keyData.recovery.value.some(b => b !== 0)) {
      this.isRecoveryEnabled = true
    }
  }

  async recover(code: string, keyData: KeyData) {
    const masterKey = await this.#decrypt(
      code,
      keyData.recovery.salt,
      keyData.recovery.iv,
      keyData.recovery.value,
    )
    this.#setMasterKey(masterKey)
    this.#setKeyData({
      password: {
        value: keyData.recovery.value.slice(),
        salt: keyData.recovery.salt.slice(),
        iv: keyData.recovery.iv.slice(),
      },
      recovery: {
        value: new Uint8Array(ENCRYPTION_CONFIG.valueLength),
        salt: new Uint8Array(ENCRYPTION_CONFIG.saltLength),
        iv: new Uint8Array(ENCRYPTION_CONFIG.ivLength),
      },
    })
    this.isAuthed = true
    this.isRecoveryEnabled = false
  }

  /**
   * 使用 FIDO 设备验证
   * @param device - FIDO 设备
   * @param password - 主密码（用于解密 master key）
   * @returns 验证是否成功
   */
  async authWithFido(device: FidoDevice, password: string): Promise<boolean> {
    if (!this.#keyData?.fido?.devices) {
      throw new Error('No FIDO devices registered')
    }

    // 查找设备
    const foundDevice = this.#keyData.fido.devices.find(d => d.id === device.id)
    if (!foundDevice) {
      throw new Error('Device not found')
    }

    // 生成认证选项
    const options = fidoService.generateAuthenticationOptions(foundDevice.credentialId)

    try {
      // 调用 WebAuthn 验证
      const response = await fidoService.authenticate(options)

      if (response.verified) {
        // FIDO 签名验证成功
        // 使用密码解密 master key
        const masterKey = await this.#decrypt(
          password,
          foundDevice.salt,
          foundDevice.iv,
          foundDevice.value,
        )

        if (masterKey) {
          this.#setMasterKey(masterKey)
          this.#setKeyData(this.#keyData)
          this.isAuthed = true
          return true
        }
      }
      return false
    }
    catch (error) {
      console.error('FIDO authentication failed:', error)
      return false
    }
  }

  /**
   * 添加 FIDO 设备（注册新设备）
   * 需要主密码来加密 master key
   */
  async addFidoDevice(
    credentialId: string,
    publicKey: string,
    name: string,
    password: string,
  ): Promise<void> {
    this.#mustAuthed()

    // 用主密码加密 master key，存储到设备中
    const salt = crypto.getRandomValues(new Uint8Array(ENCRYPTION_CONFIG.saltLength))
    const iv = crypto.getRandomValues(new Uint8Array(ENCRYPTION_CONFIG.ivLength))
    const value = await this.#encrypt(password, salt, iv, this.#masterKey!)

    const newDevice: FidoDevice = {
      id: crypto.randomUUID(),
      name,
      credentialId,
      publicKey,
      createdAt: Date.now(),
      salt: salt,
      iv: iv,
      value,
    }

    if (!this.#keyData!.fido) {
      this.#keyData!.fido = { devices: [] }
    }

    this.#keyData!.fido.devices.push(newDevice)
    this.#updateFidoDevicesList()
  }

  /**
   * 移除 FIDO 设备
   */
  async removeFidoDevice(deviceId: string): Promise<void> {
    this.#mustAuthed()

    if (!this.#keyData!.fido?.devices) {
      return
    }

    const index = this.#keyData!.fido.devices.findIndex(d => d.id === deviceId)
    if (index !== -1) {
      this.#keyData!.fido.devices.splice(index, 1)
      this.#updateFidoDevicesList()
    }
  }

  /**
   * 获取 FIDO 设备列表（不含敏感数据）
   */
  getFidoDevicesList(): Array<Pick<FidoDevice, 'id' | 'name' | 'createdAt'>> {
    return (this.#keyData?.fido?.devices ?? []).map(d => ({
      id: d.id,
      name: d.name,
      createdAt: d.createdAt,
    }))
  }

  unauth() {
    this.isAuthed = false
    this.isRecoveryEnabled = false
    if (this.#masterKey) {
      this.#masterKey.fill(0)
      this.#masterKey = null
    }

    this.#keyData = null
  }

  async validatePassword(password: string): Promise<boolean> {
    this.#mustAuthed()
    try {
      const value = await this.#encrypt(
        password,
        this.#keyData!.password.salt,
        this.#keyData!.password.iv,
        this.#masterKey!,
      )
      return equals(value, this.#keyData!.password.value)
    }
    catch {
      return false
    }
  }

  async enableRecovery() {
    this.#mustAuthed()
    const recoveryCode = PasswordGenerator.generate({
      length: 32,
      includeUppercase: true,
      includeLowercase: false,
      includeNumbers: true,
      includeSymbols: false,
      excludeSimilar: false,
      excludeAmbiguous: false,
    })
    const salt = crypto.getRandomValues(new Uint8Array(ENCRYPTION_CONFIG.saltLength))
    const iv = crypto.getRandomValues(new Uint8Array(ENCRYPTION_CONFIG.ivLength))

    this.#keyData!.recovery.salt = salt
    this.#keyData!.recovery.iv = iv
    this.#keyData!.recovery.value = await this.#encrypt(recoveryCode, salt, iv, this.#masterKey!)
    this.isRecoveryEnabled = true

    return recoveryCode
  }

  async disableRecovery() {
    this.#mustAuthed()
    this.#keyData!.recovery.salt.fill(0)
    this.#keyData!.recovery.iv.fill(0)
    this.#keyData!.recovery.value.fill(0)
    this.isRecoveryEnabled = false
  }

  async changePassword(oldPassword: string, newPassword: string) {
    if (!await this.validatePassword(oldPassword)) {
      throw new Error('old password incorrect')
    }

    const salt = crypto.getRandomValues(new Uint8Array(ENCRYPTION_CONFIG.saltLength))
    const iv = crypto.getRandomValues(new Uint8Array(ENCRYPTION_CONFIG.ivLength))
    const value = await this.#encrypt(newPassword, salt, iv, this.#masterKey!)

    this.#keyData!.password.salt = salt
    this.#keyData!.password.iv = iv
    this.#keyData!.password.value = value
  }

  async changeMasterKey(password: string) {
    this.#masterKey = null
    const masterKey = crypto.getRandomValues(new Uint8Array(ENCRYPTION_CONFIG.masterKeyLength))
    const salt = crypto.getRandomValues(new Uint8Array(ENCRYPTION_CONFIG.saltLength))
    const iv = crypto.getRandomValues(new Uint8Array(ENCRYPTION_CONFIG.ivLength))
    const value = await this.#encrypt(password, salt, iv, masterKey)

    // 初始化keyData（如果是新数据库）
    if (!this.#keyData) {
      this.#keyData = {
        password: {
          salt: new Uint8Array(ENCRYPTION_CONFIG.saltLength),
          iv: new Uint8Array(ENCRYPTION_CONFIG.ivLength),
          value: new Uint8Array(ENCRYPTION_CONFIG.valueLength),
        },
        recovery: {
          salt: new Uint8Array(ENCRYPTION_CONFIG.saltLength),
          iv: new Uint8Array(ENCRYPTION_CONFIG.ivLength),
          value: new Uint8Array(ENCRYPTION_CONFIG.valueLength),
        },
      }
    }

    this.#setMasterKey(masterKey)
    this.#keyData.password.salt = salt
    this.#keyData.password.iv = iv
    this.#keyData.password.value = value

    // change master key will disable recovery
    this.#keyData.recovery.value.fill(0)
    this.#keyData.recovery.salt.fill(0)
    this.#keyData.recovery.iv.fill(0)
    this.isRecoveryEnabled = false

    return {
      salt,
      iv,
      value,
    }
  }

  async encryptData(str: string) {
    this.#mustAuthed()

    const data = new TextEncoder().encode(str)
    const iv = crypto.getRandomValues(new Uint8Array(ENCRYPTION_CONFIG.ivLength))

    const key = await crypto.subtle.importKey(
      'raw',
      this.#masterKey!.slice().buffer,
      { name: ENCRYPTION_CONFIG.algorithm },
      false,
      ['encrypt'],
    )

    const encrypted = await crypto.subtle.encrypt(
      { name: ENCRYPTION_CONFIG.algorithm, iv },
      key,
      data,
    )

    const result = new Uint8Array(iv.length + encrypted.byteLength)
    result.set(iv)
    result.set(new Uint8Array(encrypted), iv.length)

    return result
  }

  async decryptData(encryptedData: Uint8Array) {
    this.#mustAuthed()

    const iv = encryptedData.slice(0, ENCRYPTION_CONFIG.ivLength)
    const encrypted = encryptedData.slice(ENCRYPTION_CONFIG.ivLength)

    const key = await crypto.subtle.importKey(
      'raw',
      this.#masterKey!.slice().buffer,
      { name: ENCRYPTION_CONFIG.algorithm },
      false,
      ['decrypt'],
    )

    const decrypted = await crypto.subtle.decrypt(
      { name: ENCRYPTION_CONFIG.algorithm, iv },
      key,
      encrypted,
    )

    return new TextDecoder().decode(decrypted)
  }
}

export const auth = new Auth()
