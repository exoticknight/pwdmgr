// TOTP配置接口
export interface TOTPConfig {
  secret: string
  algorithm: 'SHA1' | 'SHA256' | 'SHA512'
  digits: 6 | 8
  period: number
  issuer?: string
  accountName?: string
}

// TOTP结果接口
export interface TOTPResult {
  code: string
  remainingTime: number
  progress: number // 0-1之间的进度
  nextCode?: string // 下一个验证码预览
}

// QR码解析结果
export interface QRCodeData {
  type: 'totp' | 'hotp'
  label: string
  secret: string
  issuer?: string
  algorithm?: string
  digits?: string
  period?: string
  counter?: string
}

// 服务提供商信息
export interface ServiceProviderInfo {
  name: string
  iconUrl?: string
  websiteUrl?: string
  backgroundColor?: string
  textColor?: string
}

// 2FA输入模式
export type TwoFactorInputMode = 'manual' | 'image' | 'url'
