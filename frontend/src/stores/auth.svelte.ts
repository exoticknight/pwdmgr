import type { KeyData } from '@/types/crypto'
import { ENCRYPTION_CONFIG } from '@/consts/encryption'
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
  }

  get keyData(): KeyData {
    return {
      ...this.#keyData!,
    }
  }

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
    const masterKey = await this.#decrypt(password, keyData.passwordSalt, keyData.passwordIv, keyData.passwordEncryptedMasterKey)
    this.#setMasterKey(masterKey)
    this.#setKeyData({
      ...keyData,
    })
    this.isAuthed = true

    if (keyData.recoveryEncryptedMasterKey.some(b => b !== 0)) {
      this.isRecoveryEnabled = true
    }
  }

  async recover(code: string, keyData: KeyData) {
    const masterKey = await this.#decrypt(code, keyData.recoverySalt, keyData.recoveryIv, keyData.recoveryEncryptedMasterKey)
    this.#setMasterKey(masterKey)
    this.#setKeyData({
      passwordEncryptedMasterKey: keyData.recoveryEncryptedMasterKey,
      passwordSalt: keyData.recoverySalt,
      passwordIv: keyData.recoveryIv,
      recoveryEncryptedMasterKey: new Uint8Array(ENCRYPTION_CONFIG.encryptedMasterKeyLength),
      recoverySalt: new Uint8Array(ENCRYPTION_CONFIG.saltLength),
      recoveryIv: new Uint8Array(ENCRYPTION_CONFIG.ivLength),
    })
    this.isAuthed = true
    this.isRecoveryEnabled = false
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
      const encryptedMasterKey = await this.#encrypt(password, this.#keyData!.passwordSalt, this.#keyData!.passwordIv, this.#masterKey!)
      return equals(encryptedMasterKey, this.#keyData!.passwordEncryptedMasterKey)
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

    this.#keyData!.recoverySalt = salt
    this.#keyData!.recoveryIv = iv
    this.#keyData!.recoveryEncryptedMasterKey = await this.#encrypt(recoveryCode, salt, iv, this.#masterKey!)
    this.isRecoveryEnabled = true

    return recoveryCode
  }

  async disableRecovery() {
    this.#mustAuthed()
    this.#keyData!.recoverySalt.fill(0)
    this.#keyData!.recoveryIv.fill(0)
    this.#keyData!.recoveryEncryptedMasterKey.fill(0)
    this.isRecoveryEnabled = false
  }

  async changePassword(oldPassword: string, newPassword: string) {
    if (!await this.validatePassword(oldPassword)) {
      throw new Error('old password incorrect')
    }

    const salt = crypto.getRandomValues(new Uint8Array(ENCRYPTION_CONFIG.saltLength))
    const iv = crypto.getRandomValues(new Uint8Array(ENCRYPTION_CONFIG.ivLength))
    const encryptedMasterKey = await this.#encrypt(newPassword, salt, iv, this.#masterKey!)

    this.#keyData!.passwordSalt = salt
    this.#keyData!.passwordIv = iv
    this.#keyData!.passwordEncryptedMasterKey = encryptedMasterKey
  }

  async changeMasterKey(password: string) {
    this.#masterKey = null
    const masterKey = crypto.getRandomValues(new Uint8Array(ENCRYPTION_CONFIG.masterKeyLength))
    const salt = crypto.getRandomValues(new Uint8Array(ENCRYPTION_CONFIG.saltLength))
    const iv = crypto.getRandomValues(new Uint8Array(ENCRYPTION_CONFIG.ivLength))
    const encryptedMasterKey = await this.#encrypt(password, salt, iv, masterKey)

    this.#setMasterKey(masterKey)
    this.#keyData!.passwordSalt = salt
    this.#keyData!.passwordIv = iv
    this.#keyData!.passwordEncryptedMasterKey = encryptedMasterKey

    // change master key will disable recovery
    this.#keyData!.recoveryEncryptedMasterKey.fill(0)
    this.#keyData!.recoverySalt.fill(0)
    this.#keyData!.recoveryIv.fill(0)
    this.isRecoveryEnabled = false

    return {
      salt,
      iv,
      encryptedMasterKey,
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
