export interface Setting {
  interface: {
    theme: 'light' | 'dark' | 'system'
  }
  language: {
    code: 'en' | 'zh' | 'ja'
  }
  security: {
    autoLock: boolean
    autoLockTime: number // in minutes
  }
}
