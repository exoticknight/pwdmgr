import type { QRCodeData, ServiceProviderInfo, TOTPResult } from '../types/2fa'
import type { TwoFactorAuthData } from '../types/data'
import { TOTPGenerator } from '../utils/totp'

/**
 * 客户端2FA服务 - 管理用户存储的2FA条目
 */
export class Client2FAService {
  private static readonly KNOWN_SERVICES: Record<string, ServiceProviderInfo> = {
    Google: {
      name: 'Google',
      backgroundColor: '#4285f4',
      textColor: '#ffffff',
    },
    GitHub: {
      name: 'GitHub',
      backgroundColor: '#24292e',
      textColor: '#ffffff',
    },
    Microsoft: {
      name: 'Microsoft',
      backgroundColor: '#0078d4',
      textColor: '#ffffff',
    },
    Discord: {
      name: 'Discord',
      backgroundColor: '#5865f2',
      textColor: '#ffffff',
    },
    Steam: {
      name: 'Steam',
      backgroundColor: '#171a21',
      textColor: '#ffffff',
    },
    Twitter: {
      name: 'Twitter',
      backgroundColor: '#1da1f2',
      textColor: '#ffffff',
    },
    Facebook: {
      name: 'Facebook',
      backgroundColor: '#1877f2',
      textColor: '#ffffff',
    },
    Amazon: {
      name: 'Amazon',
      backgroundColor: '#ff9900',
      textColor: '#000000',
    },
  }

  /**
   * 从QR码数据创建2FA条目
   */
  static createFrom2FAData(qrData: QRCodeData): Partial<TwoFactorAuthData> {
    const now = new Date().toISOString()

    // 解析标签以获取issuer和账户名
    let issuer = qrData.issuer ?? ''
    let accountName = qrData.label

    if (qrData.label.includes(':')) {
      const parts = qrData.label.split(':', 2)
      issuer = issuer || parts[0].trim()
      accountName = parts[1].trim()
    }

    return {
      title: `${issuer || 'Unknown'} - ${accountName}`,
      issuer,
      accountName,
      secret: qrData.secret,
      algorithm: (qrData.algorithm as 'SHA1' | 'SHA256' | 'SHA512') || 'SHA1',
      digits: (qrData.digits != null ? Number.parseInt(qrData.digits, 10) : 6) as 6 | 8,
      period: qrData.period != null ? Number.parseInt(qrData.period, 10) : 30,
      _isFavorite: false,
      _createdAt: now,
      _updatedAt: now,
    }
  }

  /**
   * 生成当前TOTP验证码
   */
  static generateCurrentTOTP(entry: TwoFactorAuthData): TOTPResult {
    const config = {
      secret: entry.secret,
      algorithm: entry.algorithm,
      digits: entry.digits,
      period: entry.period,
      issuer: entry.issuer,
      accountName: entry.accountName,
    }

    return TOTPGenerator.generate(config)
  }

  /**
   * 识别服务提供商
   */
  static identifyServiceProvider(issuer: string): ServiceProviderInfo {
    const normalizedIssuer = issuer.trim()

    // 查找已知服务
    for (const [key, info] of Object.entries(this.KNOWN_SERVICES)) {
      if (normalizedIssuer.toLowerCase().includes(key.toLowerCase())) {
        return info
      }
    }

    // 返回默认信息
    return {
      name: normalizedIssuer || 'Unknown Service',
      backgroundColor: '#6b7280',
      textColor: '#ffffff',
    }
  }

  /**
   * 验证2FA条目数据
   */
  static validate2FAData(data: Partial<TwoFactorAuthData>): string[] {
    const errors: string[] = []

    if (data.title == null || data.title.trim() === '') {
      errors.push('Title is required')
    }

    if (data.issuer == null || data.issuer.trim() === '') {
      errors.push('Issuer is required')
    }

    if (data.accountName == null || data.accountName.trim() === '') {
      errors.push('Account name is required')
    }

    if (data.secret == null || data.secret.trim() === '') {
      errors.push('Secret is required')
    }
    else if (!TOTPGenerator.validateSecret(data.secret)) {
      errors.push('Invalid secret format')
    }

    if (!data.algorithm || !['SHA1', 'SHA256', 'SHA512'].includes(data.algorithm)) {
      errors.push('Invalid algorithm')
    }

    if (!data.digits || ![6, 8].includes(data.digits)) {
      errors.push('Digits must be 6 or 8')
    }

    if (data.period == null || data.period < 1 || data.period > 300) {
      errors.push('Period must be between 1 and 300 seconds')
    }

    return errors
  }

  /**
   * 生成导出数据
   */
  static exportToBackup(entries: TwoFactorAuthData[]): string {
    const exportData = {
      version: '1.0',
      type: '2fa_backup',
      timestamp: new Date().toISOString(),
      entries: entries.map(entry => ({
        title: entry.title,
        issuer: entry.issuer,
        accountName: entry.accountName,
        secret: entry.secret,
        algorithm: entry.algorithm,
        digits: entry.digits,
        period: entry.period,
        notes: entry.notes,
        serviceUrl: entry.serviceUrl,
      })),
    }

    return JSON.stringify(exportData, null, 2)
  }

  /**
   * 解析导入数据
   */
  static parseBackupData(data: string): Partial<TwoFactorAuthData>[] {
    try {
      const parsed = JSON.parse(data) as {
        type: string
        entries: Array<{
          title: string
          issuer: string
          accountName: string
          secret: string
          algorithm?: string
          digits?: number
          period?: number
          notes?: string
          serviceUrl?: string
        }>
      }

      if (parsed.type !== '2fa_backup' || !Array.isArray(parsed.entries)) {
        throw new Error('Invalid backup format')
      }

      const now = new Date().toISOString()

      return parsed.entries.map(entry => ({
        title: entry.title,
        issuer: entry.issuer,
        accountName: entry.accountName,
        secret: entry.secret,
        algorithm: (entry.algorithm as 'SHA1' | 'SHA256' | 'SHA512') || 'SHA1',
        digits: (entry.digits as 6 | 8) || 6,
        period: entry.period ?? 30,
        notes: entry.notes,
        serviceUrl: entry.serviceUrl,
        _isFavorite: false,
        _createdAt: now,
        _updatedAt: now,
      }))
    }
    catch (error) {
      console.error('Failed to parse backup data:', error)
      throw new Error('Invalid backup file format')
    }
  }
}
