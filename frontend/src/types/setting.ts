import type { NavigationConfig } from '@/types/navigation'

export type Theme = 'light' | 'dark' | 'system'
export type LanguageCode = 'en' | 'zh' | 'ja'

export interface TwoFactorAuthConfig {
  enabled: boolean
  secretEnc: string
  algorithm: 'SHA1' | 'SHA256' | 'SHA512'
  digits: 6 | 8
  period: number // in seconds
  backupCodes: string[] // SHA-256 hashed backup codes
  lastUsedCode?: string // replay prevention
  failedAttempts: number
  lockedUntil?: number // timestamp ms, lockout after max failures
}

export interface Setting {
  interface: {
    theme: Theme
    navigation: NavigationConfig
  }
  language: {
    code: LanguageCode
  }
  security: {
    autoLock: boolean
    autoLockTime: number // in minutes
    twoFactorAuth?: TwoFactorAuthConfig
    fidoEnabled: boolean
    fidoAsPrimary: boolean
    fidoAsSecondFactor: boolean
  }
}
