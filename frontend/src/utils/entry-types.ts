import type { BasicData } from '@/types/data'

export function getEntryTypeLabel(type: BasicData['_type'], i18n: { t: (key: string) => string }): string {
  switch (type) {
    case 'password':
      return i18n.t('entryTypes.password')
    case 'encrypted_text':
      return i18n.t('entryTypes.encryptedText')
    case 'two_factor_auth':
      return i18n.t('entryTypes.twoFactorAuth')
    case 'payment':
      return i18n.t('entryTypes.payment')
    case 'phone':
      return i18n.t('entryTypes.phone')
    default:
      return ''
  }
}
