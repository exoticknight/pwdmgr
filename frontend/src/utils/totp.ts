import type { TOTPResult } from '@/types/2fa'
import type { TwoFactorAuthData } from '@/types/data'
import * as OTPAuth from 'otpauth'

/**
 * Generate TOTP verification code
 */
export function generate(config: TwoFactorAuthData): TOTPResult {
  try {
    const totp = new OTPAuth.TOTP({
      ...config,
      label: config.username,
    })

    const remainingTime = Math.round(totp.remaining() / 1000)
    const progress = remainingTime / config.period

    const currentCode = totp.generate()

    // Generate next verification code preview
    const nextTimestamp = Date.now() + (config.period * 1000)
    const nextCode = totp.generate({
      timestamp: nextTimestamp,
    })

    return {
      code: currentCode,
      remainingTime,
      progress,
      nextCode,
    }
  }
  catch (error) {
    console.error('Failed to generate TOTP:', error)
    throw new Error('Failed to generate verification code')
  }
}

/**
 * Validate secret format
 */
export function validateSecret(secret: string): boolean {
  try {
    // Try to create a TOTP instance to verify secret
    const totp = new OTPAuth.TOTP({
      secret,
    })
    // Try to generate a token to verify secret validity
    totp.generate()
    return true
  }
  catch {
    return false
  }
}

/**
 * Calculate remaining time
 */
export function getRemainingTime(period: number): number {
  const now = Math.floor(Date.now() / 1000)
  const currentPeriodStart = Math.floor(now / period) * period
  return currentPeriodStart + period - now
}

/**
 * Generate random secret key
 */
export function generateSecret(): string {
  const secret = new OTPAuth.Secret()
  return secret.base32
}

/**
 * Verify TOTP code
 */
export function verify(token: string, config: TwoFactorAuthData, window = 1): boolean {
  try {
    const totp = new OTPAuth.TOTP({
      issuer: config.issuer,
      label: config.username,
      algorithm: config.algorithm,
      digits: config.digits,
      period: config.period,
      secret: config.secret,
    })

    const delta = totp.validate({
      token,
      window,
    })

    return delta !== null
  }
  catch (error) {
    console.error('Failed to verify TOTP:', error)
    return false
  }
}

/**
 * Generate QR code URL
 */
export function generateTOTPURL(config: TwoFactorAuthData): string {
  const totp = new OTPAuth.TOTP({
    issuer: config.issuer,
    label: config.username,
    algorithm: config.algorithm,
    digits: config.digits,
    period: config.period,
    secret: config.secret,
  })

  return totp.toString()
}
