import i18next from 'i18next'
import { DEFAULT_SETTINGS } from '@/consts/setting'
import { en } from './locales/en'
import { ja } from './locales/ja'
import { zh } from './locales/zh'

const resources = {
  en,
  zh,
  ja,
}

void i18next.init({
  lng: DEFAULT_SETTINGS.language.code,
  fallbackLng: DEFAULT_SETTINGS.language.code,
  resources,
  interpolation: {
    escapeValue: false, // not needed for svelte as it escapes by default
  },
})

export default i18next
