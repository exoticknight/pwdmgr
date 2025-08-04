<script lang='ts'>
  import type { LanguageCode } from '@/types/setting'
  import { Settings } from '@lucide/svelte'
  import { i18n } from '@/stores/i18n.svelte'
  import { setting } from '@/stores/setting.svelte'
  import { userState } from '@/stores/user.svelte'

  // Check if database file has been saved
  const hasDataFile = $derived(!!userState.dbPath)

  function handleLanguageChange(event: Event) {
    const select = event.target as HTMLSelectElement
    const selectedLanguage = select.value as LanguageCode
    setting.updateSetting('language.code', selectedLanguage)
    i18n.changeLanguage(selectedLanguage)
  }

  function handleThemeChange(event: Event) {
    const select = event.target as HTMLSelectElement
    const selectedTheme = select.value as 'light' | 'dark' | 'system'
    setting.updateSetting('interface.theme', selectedTheme)
  }

  function handleAutoLockChange(event: Event) {
    const checkbox = event.target as HTMLInputElement
    setting.updateSetting('security.autoLock', checkbox.checked)
  }

  function handleAutoLockTimeChange(event: Event) {
    const select = event.target as HTMLSelectElement
    const selectedTime = Number(select.value)
    setting.updateSetting('security.autoLockTime', selectedTime)
  }
</script>

<style scoped>
.setting-container {
  display: flex;
  flex-direction: column;
}

.setting-section {
  display: flex;
  flex-direction: column;
}

.setting-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.setting-label {
  flex: 1;
}

.setting-title {
  font-weight: 500;
}

.setting-description {
  font-size: 0.875rem;
  opacity: 0.7;
  margin-top: 0.25rem;
}

.select-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>

<div class='overflow-y-auto h-full'>
  {#if hasDataFile}
    <div class='setting-container gap-8 m-4'>
      <!-- Security Settings -->
      <div class='setting-section'>
        <h1 class='text-xl font-semibold text-base-content'>{i18n.t('setting.security.title')}</h1>
        <div class='divider'></div>

        <div class='setting-content'>
          <div class='setting-item'>
            <div class='setting-label'>
              <div class='setting-title text-base-content'>{i18n.t('setting.security.autoLock')}</div>
              <div class='setting-description text-base-content'>{i18n.t('setting.security.autoLockDescription')}</div>
            </div>
            <input
              type='checkbox'
              class='toggle toggle-primary'
              checked={setting.data.security.autoLock}
              onchange={handleAutoLockChange}
            />
          </div>

          <div class='setting-item'>
            <div class='setting-label'>
              <div class='setting-title text-base-content'>{i18n.t('setting.security.autoLockTime')}</div>
              <div class='setting-description text-base-content'>{i18n.t('setting.security.autoLockTimeDescription')}</div>
            </div>
            <select
              id='auto-lock-time'
              class='select select-bordered max-w-fit'
              class:select-disabled={!setting.data.security.autoLock}
              value={`${setting.data.security.autoLockTime}`}
              disabled={!setting.data.security.autoLock}
              onchange={handleAutoLockTimeChange}
            >
              <option value='5'>5 {i18n.t('setting.time.minutes')}</option>
              <option value='10'>10 {i18n.t('setting.time.minutes')}</option>
              <option value='15'>15 {i18n.t('setting.time.minutes')}</option>
              <option value='30'>30 {i18n.t('setting.time.minutes')}</option>
              <option value='60'>1 {i18n.t('setting.time.hour')}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Interface Settings -->
      <div class='setting-section'>
        <h1 class='text-xl font-semibold text-base-content'>{i18n.t('setting.interface.title')}</h1>
        <div class='divider'></div>

        <div class='setting-content'>
          <div class='setting-item'>
            <div class='setting-label'>
              <div class='setting-title text-base-content'>{i18n.t('setting.interface.language')}</div>
              <div class='setting-description text-base-content'>{i18n.t('setting.interface.languageDescription')}</div>
            </div>
            <select
              id='language-select'
              class='select max-w-fit'
              value={setting.data.language.code}
              onchange={handleLanguageChange}
            >
              <option value='en'>English</option>
              <option value='zh'>中文</option>
              <option value='ja'>日本語</option>
            </select>
          </div>

          <div class='setting-item'>
            <div class='setting-label'>
              <div class='setting-title text-base-content'>{i18n.t('setting.interface.theme')}</div>
              <div class='setting-description text-base-content'>{i18n.t('setting.interface.themeDescription')}</div>
            </div>
            <select
              id='theme-select'
              class='select max-w-fit'
              value={setting.data.interface.theme}
              onchange={handleThemeChange}
            >
              <option value='system'>{i18n.t('setting.interface.themeAuto')}</option>
              <option value='light'>{i18n.t('setting.interface.themeLight')}</option>
              <option value='dark'>{i18n.t('setting.interface.themeDark')}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- About -->
      <div class='setting-section'>
        <h1 class='text-xl font-semibold text-base-content'>{i18n.t('setting.about.title')}</h1>
        <div class='divider'></div>

        <div class='setting-content'>
          <div class='setting-item'>
            <div class='flex-1'>
              <div class='setting-title text-base-content'>{i18n.t('setting.about.version')}</div>
              <div class='setting-description text-base-content'>1.0.0</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  {:else}
    <!-- Empty panel using DaisyUI hero component and Lucide icons -->
    <div class='hero h-full'>
      <div class='hero-content text-center'>
        <div class='max-w-md'>
          <Settings class='w-16 h-16 mx-auto mb-4 text-base-content/50' />
          <h1 class='text-xl font-bold text-base-content mb-2'>{i18n.t('setting.saveRequired.title')}</h1>
          <p class='text-sm text-base-content/70'>{i18n.t('setting.saveRequired.description')}</p>
        </div>
      </div>
    </div>
  {/if}
</div>
