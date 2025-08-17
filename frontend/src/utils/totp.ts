import type { TOTPConfig, TOTPResult, TwoFAData } from '@/types/2fa'
import * as OTPAuth from 'otpauth'
import typia from 'typia'

export class TOTPGenerator {
  /**
   * Generate TOTP verification code
   */
  static generate(config: TOTPConfig): TOTPResult {
    try {
      const totp = new OTPAuth.TOTP({
        issuer: config.issuer,
        label: config.username,
        algorithm: config.algorithm,
        digits: config.digits,
        period: config.period,
        secret: config.secret,
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
   * Parse URI
   */
  static parseURI(urlStr: string): TwoFAData {
    try {
      const uri = OTPAuth.URI.parse(urlStr)

      const type = (uri as OTPAuth.TOTP).period ? 'totp' : 'hotp'
      if (type === 'hotp') {
        const data = typia.assert<OTPAuth.HOTP>(uri)
        return {
          type,
          label: data.label,
          secret: data.secret.base32,
          issuer: data.issuer ?? undefined,
          algorithm: data.algorithm ?? undefined,
          digits: data.digits ?? undefined,
          counter: data.counter ?? undefined,
        }
      }
      if (type === 'totp') {
        const data = typia.assert<OTPAuth.TOTP>(uri)
        return {
          type,
          label: data.label,
          secret: data.secret.base32,
          issuer: data.issuer ?? undefined,
          algorithm: data.algorithm ?? undefined,
          digits: data.digits ?? undefined,
          period: data.period ?? undefined,
        }
      }

      throw new Error('Unsupported URI type')
    }
    catch (error) {
      console.error('Failed to parse URI:', error)
      throw new Error('Invalid URI format')
    }
  }

  /**
   * Validate secret format
   */
  static validateSecret(secret: string): boolean {
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
  static getRemainingTime(period: number): number {
    const now = Math.floor(Date.now() / 1000)
    const currentPeriodStart = Math.floor(now / period) * period
    return currentPeriodStart + period - now
  }

  /**
   * Generate random secret key
   */
  static generateSecret(): string {
    const secret = new OTPAuth.Secret()
    return secret.base32
  }

  /**
   * Verify TOTP code
   */
  static verify(token: string, config: TOTPConfig, window = 1): boolean {
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
  static generateQRCodeURL(config: TOTPConfig): string {
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
}
