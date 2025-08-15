// TOTP配置接口
export interface TOTPConfig {
  secret: string
  algorithm: 'SHA1' | 'SHA256' | 'SHA512'
  digits: 6 | 8
  period: number
  issuer?: string
  username?: string
}

// TOTP结果接口
export interface TOTPResult {
  code: string
  remainingTime: number
  progress: number // 0-1之间的进度
  nextCode?: string // 下一个验证码预览
}

// QR码解析结果
export interface TwoFAData {
  type: 'totp' | 'hotp'
  label: string
  secret: string
  issuer?: string
  algorithm?: string
  digits?: number
  period?: number // TOTP
  counter?: number // HOTP
}

// 服务提供商信息
export interface ServiceProviderInfo {
  name: string
  iconUrl?: string
  websiteUrl?: string
  backgroundColor?: string
  textColor?: string
}
