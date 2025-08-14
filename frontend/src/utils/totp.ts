import type { QRCodeData, TOTPConfig, TOTPResult } from '../types/2fa'
import * as OTPAuth from 'otpauth'

export class TOTPGenerator {
  /**
   * 生成TOTP验证码
   */
  static generate(config: TOTPConfig): TOTPResult {
    try {
      const totp = new OTPAuth.TOTP({
        issuer: config.issuer,
        label: config.accountName,
        algorithm: config.algorithm,
        digits: config.digits,
        period: config.period,
        secret: config.secret,
      })

      const now = Math.floor(Date.now() / 1000)
      const currentPeriodStart = Math.floor(now / config.period) * config.period
      const remainingTime = currentPeriodStart + config.period - now
      const progress = 1 - (remainingTime / config.period)

      const currentCode = totp.generate()

      // 生成下一个验证码预览
      const nextCode = totp.generate({
        timestamp: (currentPeriodStart + config.period) * 1000,
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
   * 解析QR码URL
   */
  static parseQRCode(url: string): QRCodeData {
    try {
      const urlObj = new URL(url)

      if (urlObj.protocol !== 'otpauth:') {
        throw new Error('Invalid OTP URL protocol')
      }

      const type = urlObj.hostname as 'totp' | 'hotp'
      if (type !== 'totp' && type !== 'hotp') {
        throw new Error('Unsupported OTP type')
      }

      const label = decodeURIComponent(urlObj.pathname.substring(1))
      const secret = urlObj.searchParams.get('secret')

      if (!secret || secret.trim() === '') {
        throw new Error('Missing secret parameter')
      }

      const issuer = urlObj.searchParams.get('issuer')
      const algorithm = urlObj.searchParams.get('algorithm')
      const digits = urlObj.searchParams.get('digits')
      const period = urlObj.searchParams.get('period')
      const counter = urlObj.searchParams.get('counter')

      return {
        type,
        label,
        secret,
        issuer: issuer ?? undefined,
        algorithm: algorithm ?? undefined,
        digits: digits ?? undefined,
        period: period ?? undefined,
        counter: counter ?? undefined,
      }
    }
    catch (error) {
      console.error('Failed to parse QR code:', error)
      throw new Error('Invalid QR code format')
    }
  }

  /**
   * 验证secret格式
   */
  static validateSecret(secret: string): boolean {
    try {
      // 尝试创建一个TOTP实例来验证secret
      const totp = new OTPAuth.TOTP({
        secret,
      })
      // 尝试生成一个token来验证secret有效性
      totp.generate()
      return true
    }
    catch {
      return false
    }
  }

  /**
   * 计算剩余时间
   */
  static getRemainingTime(period: number): number {
    const now = Math.floor(Date.now() / 1000)
    const currentPeriodStart = Math.floor(now / period) * period
    return currentPeriodStart + period - now
  }

  /**
   * 生成随机密钥
   */
  static generateSecret(): string {
    const secret = new OTPAuth.Secret()
    return secret.base32
  }

  /**
   * 验证TOTP码
   */
  static verify(token: string, config: TOTPConfig, window = 1): boolean {
    try {
      const totp = new OTPAuth.TOTP({
        issuer: config.issuer,
        label: config.accountName,
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
   * 生成QR码URL
   */
  static generateQRCodeURL(config: TOTPConfig): string {
    const totp = new OTPAuth.TOTP({
      issuer: config.issuer,
      label: config.accountName,
      algorithm: config.algorithm,
      digits: config.digits,
      period: config.period,
      secret: config.secret,
    })

    return totp.toString()
  }
}
