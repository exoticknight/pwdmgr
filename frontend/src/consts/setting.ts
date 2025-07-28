import type { Setting } from '@/types/setting'

export const DEFAULT_SETTINGS: Setting = {
  interface: {
    theme: 'light',
  },
  language: {
    code: 'en',
  },
  security: {
    autoLock: false,
    autoLockTime: 5,
  },
}
