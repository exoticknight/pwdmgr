import type { Locale } from 'date-fns'
import type { LanguageCode } from '@/types/setting'

import { format, formatDistanceToNow, isAfter, parseISO, subDays } from 'date-fns'
import { enUS, ja, zhCN } from 'date-fns/locale'
import i18next from '@/i18n'
import { setting } from './setting.svelte'

const localeMap: Record<LanguageCode, Locale> = {
  en: enUS,
  zh: zhCN,
  ja,
}

let lng = $state(setting.getSetting('language.code') || i18next.language)

i18next.on('languageChanged', () => {
  lng = i18next.language as LanguageCode
})

const i18n = new class {
  get currentLanguage() {
    return lng
  }

  t(key: string, options?: Record<string, any>): string {
    void lng
    return i18next.t(key, options)
  }

  formatDate(date: Date, dateFormat = 'yyyy/MM/dd'): string {
    return format(date, dateFormat, { locale: localeMap[lng] })
  }

  formatDistanceToNow(date: string): string {
    const parsedDate = parseISO(date)
    if (isAfter(parsedDate, subDays(new Date(), 7))) {
      return formatDistanceToNow(parsedDate, { addSuffix: true, locale: localeMap[lng] })
    }
    return this.formatDate(parsedDate)
  }

  changeLanguage(lang: string) {
    void i18next.changeLanguage(lang)
  }
}()

export { i18n }
