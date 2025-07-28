import i18next from '@/i18n'

const state = $state({
  lng: i18next.language,
})

i18next.on('languageChanged', () => {
  state.lng = i18next.language
})

export default new class {
  t(key: string) {
    void state.lng
    return i18next.t(key)
  }

  changeLanguage(lang: string) {
    void i18next.changeLanguage(lang)
  }
}()
