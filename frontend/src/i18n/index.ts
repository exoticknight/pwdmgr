import i18next from 'i18next'
import { en } from './locales/en'
import { ja } from './locales/ja'
import { zh } from './locales/zh'

const resources = {
  en,
  zh,
  ja,
}

void i18next.init({
  lng: 'en', // default language
  fallbackLng: 'en',
  resources,
  interpolation: {
    escapeValue: false, // not needed for svelte as it escapes by default
  },
})

export default i18next
