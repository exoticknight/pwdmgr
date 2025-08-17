// TOTP configuration interface
export interface TOTPConfig {
  secret: string
  algorithm: 'SHA1' | 'SHA256' | 'SHA512'
  digits: 6 | 8
  period: number
  issuer?: string
  username?: string
}

// TOTP result interface
export interface TOTPResult {
  code: string
  remainingTime: number
  progress: number // Progress between 0-1
  nextCode?: string // Next verification code preview
}
