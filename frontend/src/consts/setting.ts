import type { Setting } from '@/types/setting'

export const DEFAULT_SETTINGS: Setting = {
  interface: {
    theme: 'light',
    navigation: {
      order: ['ITEMS_ALL', 'ITEMS_FAVORITES', 'ITEMS_RECENT', 'ITEMS_PASSWORD', 'ITEMS_TEXT', 'ITEMS_2FA'],
      hidden: [], // All items visible by default
    },
  },
  language: {
    code: 'en',
  },
  security: {
    autoLock: false,
    autoLockTime: 5,
  },
}
