import { ENCRYPTION_CONFIG } from '@/consts/encryption'

async function deriveKey(password: string, salt: Uint8Array, usage: Extract<KeyUsage, 'encrypt' | 'decrypt'>): Promise<CryptoKey> {
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

async function decrypt(password: string, salt: Uint8Array, iv: Uint8Array, encrypted: Uint8Array): Promise<Uint8Array> {
  const derivedKey = await deriveKey(password, salt, 'decrypt')

  const decrypted = await crypto.subtle.decrypt(
    { name: ENCRYPTION_CONFIG.algorithm, iv: iv.slice() },
    derivedKey,
    encrypted.slice(),
  )

  return new Uint8Array(decrypted)
}

async function encrypt(password: string, salt: Uint8Array, iv: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
  const derivedKey = await deriveKey(password, salt, 'encrypt')

  const encrypted = await crypto.subtle.encrypt(
    { name: ENCRYPTION_CONFIG.algorithm, iv: iv.slice() },
    derivedKey,
    data.slice(),
  )

  return new Uint8Array(encrypted)
}

export class KeyService {
  #masterKey: Uint8Array | null = null

  #setMasterKey(masterKey: Uint8Array): void {
    if (this.#masterKey) {
      this.#masterKey.fill(0)
    }

    this.#masterKey = new Uint8Array(masterKey)
  }

  #ensureUnlocked(): void {
    if (!this.#masterKey) {
      throw new Error('locked')
    }
  }

  async auth(password: string, salt: Uint8Array, iv: Uint8Array, encrypted: Uint8Array): Promise<boolean> {
    try {
      const masterKey = await decrypt(password, salt, iv, encrypted)
      this.#setMasterKey(masterKey)
      return true
    }
    catch (error) {
      console.error('Password authentication failed:', error)
      return false
    }
  }

  unauth() {
    if (this.#masterKey) {
      this.#masterKey.fill(0)
      this.#masterKey = null
    }
  }

  get isAuthed(): boolean {
    return this.#masterKey !== null
  }

  async encryptKey(password: string): Promise<{ salt: Uint8Array, iv: Uint8Array, encrypted: Uint8Array }> {
    this.#ensureUnlocked()

    const salt = crypto.getRandomValues(new Uint8Array(ENCRYPTION_CONFIG.saltLength))
    const iv = crypto.getRandomValues(new Uint8Array(ENCRYPTION_CONFIG.ivLength))
    const encrypted = await encrypt(password, salt, iv, this.#masterKey!)

    return { salt, iv, encrypted }
  }

  changeMasterKey() {
    const masterKey = crypto.getRandomValues(new Uint8Array(ENCRYPTION_CONFIG.masterKeyLength))
    this.#setMasterKey(masterKey)
  }

  async encryptData(str: string): Promise<Uint8Array> {
    this.#ensureUnlocked()

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

  async decryptData(encryptedData: Uint8Array): Promise<string> {
    this.#ensureUnlocked()

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

let keyServiceInstance: KeyService | null = null

export function getKeyService(): KeyService {
  if (!keyServiceInstance) {
    keyServiceInstance = new KeyService()
  }
  return keyServiceInstance
}

export function resetKeyService(): void {
  if (keyServiceInstance) {
    keyServiceInstance.unauth()
    keyServiceInstance = null
  }
}
