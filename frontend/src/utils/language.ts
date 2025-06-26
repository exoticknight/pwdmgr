import i18next from '../i18n'

export type Language = 'zh' | 'en' | 'ja'

export function changeLanguage(lang: Language) {
  void i18next.changeLanguage(lang)
}

export function getCurrentLanguage(): string {
  return i18next.language || 'zh'
}

export const AVAILABLE_LANGUAGES = [
  { code: 'zh', name: '中文' },
  { code: 'en', name: 'English' },
  { code: 'ja', name: '日本語' },
] as const
