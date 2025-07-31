import type { LanguageCode } from '@/types/setting'
import i18next from '@/i18n'
import { setting } from './setting.svelte'

const state = $derived({
  lng: setting.getSetting('language.code'),
})

i18next.on('languageChanged', () => {
  state.lng = i18next.language as LanguageCode
})

const i18n = new class {
  t(key: string) {
    void state.lng
    return i18next.t(key)
  }

  changeLanguage(lang: string) {
    void i18next.changeLanguage(lang)
  }
}()

export { i18n }
