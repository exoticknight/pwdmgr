<script lang='ts'>
  import type { LanguageCode } from '@/types/setting'
  import { i18n } from '@/stores/i18n.svelte'
  import { setting } from '@/stores/setting.svelte'
  import NavigationReorder from './navigation-reorder.svelte'
  import SettingItem from './setting-item.svelte'
  import SettingSection from './setting-section.svelte'

  function handleLanguageChange(event: Event, markUnsaved: () => void) {
    const select = event.target as HTMLSelectElement
    const selectedLanguage = select.value as LanguageCode

    setting.updateSetting('language.code', selectedLanguage)
    markUnsaved()

    i18n.changeLanguage(selectedLanguage)
  }

  function handleThemeChange(event: Event, markUnsaved: () => void) {
    const select = event.target as HTMLSelectElement
    const selectedTheme = select.value as 'light' | 'dark' | 'system'

    setting.updateSetting('interface.theme', selectedTheme)
    markUnsaved()
  }
</script>

<SettingSection title={i18n.t('setting.interface.title')}>
  {#snippet items(markUnsaved: () => void)}
    <SettingItem
      title={i18n.t('setting.interface.language')}
      description={i18n.t('setting.interface.languageDescription')}
    >
      {#snippet control()}
        <select
          id='language-select'
          class='select max-w-fit'
          value={setting.data.language.code}
          onchange={e => handleLanguageChange(e, markUnsaved)}
        >
          <option value='en'>English</option>
          <option value='zh'>中文</option>
          <option value='ja'>日本語</option>
        </select>
      {/snippet}
    </SettingItem>

    <SettingItem
      title={i18n.t('setting.interface.theme')}
      description={i18n.t('setting.interface.themeDescription')}
    >
      {#snippet control()}
        <select
          id='theme-select'
          class='select max-w-fit'
          value={setting.data.interface.theme}
          onchange={e => handleThemeChange(e, markUnsaved)}
        >
          <option value='system'>{i18n.t('setting.interface.themeAuto')}</option>
          <option value='light'>{i18n.t('setting.interface.themeLight')}</option>
          <option value='dark'>{i18n.t('setting.interface.themeDark')}</option>
        </select>
      {/snippet}
    </SettingItem>

    <SettingItem
      title={i18n.t('setting.interface.navigation')}
      description={i18n.t('setting.interface.navigationDescription')}
    >
      {#snippet control()}
        <NavigationReorder {markUnsaved} />
      {/snippet}
    </SettingItem>
  {/snippet}
</SettingSection>
