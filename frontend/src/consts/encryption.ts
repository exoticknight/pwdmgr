/**
 * Encryption configuration constants
 * Used across services for consistent cryptographic operations
 */

export const ENCRYPTION_CONFIG = {
  algorithm: 'AES-GCM',
  keyLength: 256,
  ivLength: 12,
  saltLength: 32,
  recoveryCodeLength: 32,
  iterations: 500000,
  hash: 'SHA-512',
  masterKeyLength: 32,
  encryptedMasterKeyLength: 48,
} as const
