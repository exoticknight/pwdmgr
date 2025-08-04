import type { LanguageCode } from '@/types/setting'
import i18next from '@/i18n'
import { setting } from './setting.svelte'

let lng = $state(setting.getSetting('language.code'))

i18next.on('languageChanged', () => {
  lng = i18next.language as LanguageCode
})

const i18n = new class {
  t(key: string, options?: Record<string, any>): string {
    void lng
    return i18next.t(key, options)
  }

  changeLanguage(lang: string) {
    void i18next.changeLanguage(lang)
  }
}()

export { i18n }
