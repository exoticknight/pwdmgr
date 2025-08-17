import type { SnakeCase } from 'type-fest'

export const DataMetaType = {
  PASSWORD: 'password',
  ENCRYPTED_TEXT: 'encrypted_text',
  TWO_FACTOR_AUTH: 'two_factor_auth',
} as const

export interface BasicData {
  _id: string
  _type: typeof DataMetaType[keyof typeof DataMetaType]
  _isFavorite: boolean
  _createdAt: string
  _updatedAt: string
  _lastUsedAt?: string
}

export const BasicDataKey: {
  [K in keyof BasicData as K extends `_${infer Rest}` ? Uppercase<SnakeCase<Rest>> : never]: K
} = {
  ID: '_id',
  TYPE: '_type',
  IS_FAVORITE: '_isFavorite',
  CREATED_AT: '_createdAt',
  UPDATED_AT: '_updatedAt',
  LAST_USED_AT: '_lastUsedAt',
} as const

export type OmitBasicDataExcept<T extends BasicData, K extends keyof typeof BasicDataKey> = Omit<T, Exclude<keyof BasicData, typeof BasicDataKey[K]>>

export interface PasswordData extends BasicData {
  _type: typeof DataMetaType.PASSWORD
  title: string
  username: string
  password: string
  notes?: string
}

export interface EncryptedTextData extends BasicData {
  _type: typeof DataMetaType.ENCRYPTED_TEXT
  title: string
  content: string
  notes?: string
}

// 2FA client data (stores 2FA information for various services)
export interface TwoFactorAuthData extends BasicData {
  _type: typeof DataMetaType.TWO_FACTOR_AUTH
  title: string
  issuer: string // Service provider (e.g. Google, GitHub, etc.)
  username: string // Account name for this service
  secret: string // Encrypted storage key
  algorithm: 'SHA1' | 'SHA256' | 'SHA512'
  digits: 6 | 8
  period: number
  notes?: string
  // Client-specific fields
  serviceUrl?: string // Service URL
  iconUrl?: string // Service icon
}

export type Datum = PasswordData | EncryptedTextData | TwoFactorAuthData
