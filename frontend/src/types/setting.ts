import type { NavigationConfig } from '@/types/navigation'

export type Theme = 'light' | 'dark' | 'system'
export type LanguageCode = 'en' | 'zh' | 'ja'

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
  }
}
