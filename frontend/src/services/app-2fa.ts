import * as OTPAuth from 'otpauth'

const APP_2FA_ISSUER = 'bei3mat6'

export type VerifyResult =
  | { ok: true }
  | { ok: false; reason: 'INVALID_CODE' | 'LOCKED' }
const BACKUP_CODE_LENGTH = 8
const BACKUP_CODE_COUNT = 10
const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_DURATION_MS = 5 * 60 * 1000 // 5 minutes

/**
 * Generate a random TOTP secret (20 bytes, Base32 encoded)
 */
export function generateSecret(): string {
  const secret = new OTPAuth.Secret({ size: 20 })
  return secret.base32
}

/**
 * Generate an otpauth:// URI for QR code display
 */
export function generateQRCodeUri(secret: string, label: string): string {
  const totp = new OTPAuth.TOTP({
    issuer: APP_2FA_ISSUER,
    label,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secret),
  })
  return totp.toString()
}

/**
 * Verify a TOTP code with ±1 time window tolerance
 */
export function verifyCode(
  secret: string,
  code: string,
  algorithm: 'SHA1' | 'SHA256' | 'SHA512' = 'SHA1',
  digits: 6 | 8 = 6,
  period: number = 30,
): boolean {
  const totp = new OTPAuth.TOTP({
    algorithm,
    digits,
    period,
    secret: OTPAuth.Secret.fromBase32(secret),
  })

  // delta returns null if invalid, or the time step difference
  const delta = totp.validate({ token: code, window: 1 })
  return delta !== null
}

/**
 * Generate backup codes (plain text, 8 characters each)
 */
export function generateBackupCodes(count: number = BACKUP_CODE_COUNT): string[] {
  const codes: string[] = []
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // exclude ambiguous: I,O,0,1

  for (let i = 0; i < count; i++) {
    const bytes = crypto.getRandomValues(new Uint8Array(BACKUP_CODE_LENGTH))
    let code = ''
    for (let j = 0; j < BACKUP_CODE_LENGTH; j++) {
      code += chars[bytes[j] % chars.length]
    }
    // format as XXXX-XXXX for readability
    codes.push(`${code.slice(0, 4)}-${code.slice(4)}`)
  }

  return codes
}

/**
 * Hash a backup code using SHA-256
 */
export async function hashBackupCode(code: string): Promise<string> {
  // normalize: remove dashes, uppercase
  const normalized = code.replace(/-/g, '').toUpperCase()
  const data = new TextEncoder().encode(normalized)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Hash multiple backup codes
 */
export async function hashBackupCodes(codes: string[]): Promise<string[]> {
  return Promise.all(codes.map(async code => hashBackupCode(code)))
}

/**
 * Verify a backup code against the list of hashed codes.
 * Returns the index of the matched code, or -1 if not found.
 */
export async function verifyBackupCode(code: string, hashedCodes: string[]): Promise<number> {
  const hashed = await hashBackupCode(code)
  return hashedCodes.indexOf(hashed)
}

/**
 * Check if the account is currently locked out
 */
export function isLockedOut(lockedUntil?: number): boolean {
  if (!lockedUntil) {
    return false
  }
  return Date.now() < lockedUntil
}

/**
 * Check if lockout has expired and should be cleared
 */
export function isLockoutExpired(lockedUntil?: number): boolean {
  if (!lockedUntil) {
    return false
  }
  return Date.now() >= lockedUntil
}

/**
 * Get remaining lockout time in seconds
 */
export function getLockoutRemainingSeconds(lockedUntil?: number): number {
  if (!lockedUntil) {
    return 0
  }
  const remaining = lockedUntil - Date.now()
  return remaining > 0 ? Math.ceil(remaining / 1000) : 0
}

/**
 * Calculate the lockout timestamp after a failed attempt
 * Returns the lockedUntil timestamp if max attempts exceeded, undefined otherwise
 */
export function calculateLockout(failedAttempts: number): number | undefined {
  if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
    return Date.now() + LOCKOUT_DURATION_MS
  }
  return undefined
}

/**
 * Check if a code was already used (replay prevention)
 */
export function isReplayCode(code: string, lastUsedCode?: string): boolean {
  if (!lastUsedCode) {
    return false
  }
  return code === lastUsedCode
}

export { LOCKOUT_DURATION_MS, MAX_FAILED_ATTEMPTS }
