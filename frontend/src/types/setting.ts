export type Theme = 'light' | 'dark' | 'system'
export type LanguageCode = 'en' | 'zh' | 'ja'

export interface Setting {
  interface: {
    theme: Theme
  }
  language: {
    code: LanguageCode
  }
  security: {
    autoLock: boolean
    autoLockTime: number // in minutes
  }
}
