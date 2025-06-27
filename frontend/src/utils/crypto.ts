// Encryption/decryption utility functions

const ENCRYPTION_CONFIG = {
  algorithm: 'AES-GCM',
  keyLength: 128,
  ivLength: 12,
  saltLength: 32, // 32 bytes for salt
  iterations: 100000,
}

/**
 * Encrypt JSON string with random salt
 * Data format: [32-byte salt][12-byte IV][encrypted data]
 * @param jsonString - JSON string to encrypt
 * @param password - User password
 * @returns Encrypted ArrayBuffer containing salt + IV + encrypted data
 */
export async function encryptData(jsonString: string, password: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(jsonString)

  // Generate random salt for this encryption
  const salt = window.crypto.getRandomValues(new Uint8Array(ENCRYPTION_CONFIG.saltLength))

  // Derive key from password using the random salt
  const keyMaterial = await getKeyMaterial(password)
  const key = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
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

  // Merge salt + IV + encrypted data
  const result = new Uint8Array(salt.length + iv.length + encryptedData.byteLength)
  result.set(salt, 0)
  result.set(iv, salt.length)
  result.set(new Uint8Array(encryptedData), salt.length + iv.length)

  return result.buffer
}

/**
 * Decrypt data with embedded salt
 * Expected format: [32-byte salt][12-byte IV][encrypted data]
 * @param encryptedData - Encrypted data with embedded salt and IV
 * @param password - User password
 * @returns Decrypted JSON string
 */
export async function decryptData(encryptedData: ArrayBuffer, password: string): Promise<string> {
  const decoder = new TextDecoder()

  // Check if data is large enough to contain salt + IV + encrypted content
  const minSize = ENCRYPTION_CONFIG.saltLength + ENCRYPTION_CONFIG.ivLength + 1
  if (encryptedData.byteLength < minSize) {
    throw new Error(`Encrypted data is too small. Expected at least ${minSize} bytes, got ${encryptedData.byteLength} bytes.`)
  }

  // Extract salt, IV and encrypted data
  const data = new Uint8Array(encryptedData)
  const salt = data.slice(0, ENCRYPTION_CONFIG.saltLength)
  const iv = data.slice(ENCRYPTION_CONFIG.saltLength, ENCRYPTION_CONFIG.saltLength + ENCRYPTION_CONFIG.ivLength)
  const encrypted = data.slice(ENCRYPTION_CONFIG.saltLength + ENCRYPTION_CONFIG.ivLength)

  // Verify we have some encrypted content
  if (encrypted.length === 0) {
    throw new Error('No encrypted content found after salt and IV.')
  }

  // Derive key from password using the stored salt
  const keyMaterial = await getKeyMaterial(password)
  const key = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
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
