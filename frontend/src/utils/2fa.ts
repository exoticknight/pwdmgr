import type { TwoFactorAuthData } from '@/types/data'
import type { ServiceProviderInfo } from '@/types/service-provider'
import * as OTPAuth from 'otpauth'
import typia from 'typia'
import { ServiceProviderService } from '@/services/service-provider'
import { validateSecret } from '@/utils/totp'

/**
 * Create 2FA entry from QR code data
 */
export function createFrom2FAData(qrData: OTPAuth.TOTP | OTPAuth.HOTP): Partial<TwoFactorAuthData> {
  const now = new Date().toISOString()

  // Parse label to get issuer and account name
  let issuer = qrData.issuer ?? ''
  let username = qrData.label

  if (qrData.label.includes(':')) {
    const parts = qrData.label.split(':', 2)
    issuer = issuer || parts[0].trim()
    username = parts[1].trim()
  }

  // Handle TOTP vs HOTP
  const isTotp = 'period' in qrData
  const period = isTotp ? qrData.period : 30

  return {
    title: `${issuer || username}`,
    issuer,
    username,
    secret: qrData.secret.base32,
    algorithm: (qrData.algorithm as 'SHA1' | 'SHA256' | 'SHA512') || 'SHA1',
    digits: (qrData.digits != null ? qrData.digits : 6) as 6 | 8,
    period,
    _isFavorite: false,
    _createdAt: now,
    _updatedAt: now,
  }
}

/**
 * Identify service provider
 */
export function identifyServiceProvider(issuer: string): ServiceProviderInfo {
  const provider = ServiceProviderService.find(issuer)

  if (provider) {
    return provider
  }

  // Return default information if not found
  return {
    name: issuer?.trim() || 'Unknown Service',
    backgroundColor: '#6b7280',
    textColor: '#ffffff',
  }
}

/**
 * 验证2FA条目数据
 * @throws {Error} 验证失败时抛出错误
 */
export function validate2FAData(data: Partial<TwoFactorAuthData>): void {
  if (data.title == null || data.title.trim() === '') {
    throw new Error('Title is required')
  }

  if (data.issuer == null || data.issuer.trim() === '') {
    throw new Error('Issuer is required')
  }

  if (data.username == null || data.username.trim() === '') {
    throw new Error('Account name is required')
  }

  if (data.secret == null || data.secret.trim() === '') {
    throw new Error('Secret is required')
  }
  else if (!validateSecret(data.secret)) {
    throw new Error('Invalid secret format')
  }

  if (!data.algorithm || !['SHA1', 'SHA256', 'SHA512'].includes(data.algorithm)) {
    throw new Error('Invalid algorithm')
  }

  if (!data.digits || ![6, 8].includes(data.digits)) {
    throw new Error('Digits must be 6 or 8')
  }

  if (data.period == null || data.period < 1 || data.period > 300) {
    throw new Error('Period must be between 1 and 300 seconds')
  }
}

/**
 * 生成导出数据
 */
export function exportToBackup(entries: TwoFactorAuthData[]): string {
  const exportData = {
    version: '1.0',
    type: '2fa_backup',
    timestamp: new Date().toISOString(),
    entries: entries.map(entry => ({
      title: entry.title,
      issuer: entry.issuer,
      username: entry.username,
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
export function parseBackupData(data: string): Partial<TwoFactorAuthData>[] {
  try {
    const parsed = JSON.parse(data) as {
      type: string
      entries: Array<{
        title: string
        issuer: string
        username: string
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
      username: entry.username,
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

/**
 * Parse URI
 */
export function parseURI(urlStr: string): OTPAuth.TOTP | OTPAuth.HOTP {
  try {
    const uri = OTPAuth.URI.parse(urlStr)

    const type = (uri as OTPAuth.TOTP).period ? 'totp' : 'hotp'
    if (type === 'hotp') {
      return typia.assert<OTPAuth.HOTP>(uri)
    }
    if (type === 'totp') {
      return typia.assert<OTPAuth.TOTP>(uri)
    }

    throw new Error('Unsupported URI type')
  }
  catch (error) {
    console.error('Failed to parse URI:', error)
    throw new Error('Invalid URI format')
  }
}
