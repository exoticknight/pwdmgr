import type { SnakeCase } from 'type-fest'

export interface Setting {}

export const DataMetaType = {
  PASSWORD: 'password',
} as const

export interface BasicData {
  _id: string
  _type: typeof DataMetaType[keyof typeof DataMetaType]
  _isFavorite: boolean
  _createdAt: string
  _updatedAt: string
  _lastUsedAt: string
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

export type Datum = PasswordData

export interface DatabaseFile {
  version: string
  settings: Setting
  data: Datum[]
}
