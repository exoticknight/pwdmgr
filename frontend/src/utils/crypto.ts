// Encryption/decryption utility functions

const ENCRYPTION_CONFIG = {
  algorithm: 'AES-GCM',
  keyLength: 128,
  ivLength: 12,
  iterations: 100000,
}

/**
 * Encrypt JSON string
 * @param jsonString - JSON string to encrypt
 * @param password - User password
 * @returns Encrypted ArrayBuffer
 */
export async function encryptData(jsonString: string, password: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(jsonString)

  // Derive key from password
  const keyMaterial = await getKeyMaterial(password)
  const key = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('password-manager-salt'),
      iterations: ENCRYPTION_CONFIG.iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    {
      name: ENCRYPTION_CONFIG.algorithm,
      length: ENCRYPTION_CONFIG.keyLength,
    },
    false,
    ['encrypt'],
  )

  // Generate random IV
  const iv = window.crypto.getRandomValues(new Uint8Array(ENCRYPTION_CONFIG.ivLength))

  // Encrypt data
  const encryptedData = await window.crypto.subtle.encrypt(
    {
      name: ENCRYPTION_CONFIG.algorithm,
      iv,
    },
    key,
    dataBuffer,
  )

  // Merge IV and encrypted data
  const result = new Uint8Array(iv.length + encryptedData.byteLength)
  result.set(iv, 0)
  result.set(new Uint8Array(encryptedData), iv.length)

  return result.buffer
}

/**
 * Decrypt data
 * @param encryptedData - Encrypted data
 * @param password - User password
 * @returns Decrypted JSON string
 */
export async function decryptData(encryptedData: ArrayBuffer, password: string): Promise<string> {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()

  // Extract IV and encrypted data
  const data = new Uint8Array(encryptedData)
  const iv = data.slice(0, ENCRYPTION_CONFIG.ivLength)
  const encrypted = data.slice(ENCRYPTION_CONFIG.ivLength)

  // Derive key from password
  const keyMaterial = await getKeyMaterial(password)
  const key = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('password-manager-salt'),
      iterations: ENCRYPTION_CONFIG.iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    {
      name: ENCRYPTION_CONFIG.algorithm,
      length: ENCRYPTION_CONFIG.keyLength,
    },
    false,
    ['decrypt'],
  )

  // Decrypt data
  const decryptedData = await window.crypto.subtle.decrypt(
    {
      name: ENCRYPTION_CONFIG.algorithm,
      iv,
    },
    key,
    encrypted,
  )

  return decoder.decode(decryptedData)
}

/**
 * Get key material from password
 */
async function getKeyMaterial(password: string): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  return window.crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey'],
  )
}
