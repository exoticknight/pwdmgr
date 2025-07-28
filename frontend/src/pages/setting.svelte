<script lang='ts'>
  import i18n from '@/stores/i18n.svelte'

  function handleLanguageChange(event: Event) {
    const select = event.target as HTMLSelectElement
    const selectedLanguage = select.value
    i18n.changeLanguage(selectedLanguage)
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
</style>

<div class='overflow-y-auto h-full'>
  <div class='setting-container gap-8 m-4'>
    <!-- 安全设置 -->
    <div class='setting-section'>
      <h1 class='text-xl font-semibold text-base-content'>{i18n.t('setting.security.title')}</h1>
      <div class='divider'></div>

      <div class='setting-content'>
        <div class='setting-item'>
          <div class='setting-label'>
            <div class='setting-title text-base-content'>{i18n.t('setting.security.autoLock')}</div>
            <div class='setting-description text-base-content'>{i18n.t('setting.security.autoLockDescription')}</div>
          </div>
          <input type='checkbox' class='toggle' />
        </div>

        <div class='setting-item'>
          <div class='setting-label'>
            <div class='setting-title text-base-content'>{i18n.t('setting.security.autoLockTime')}</div>
            <div class='setting-description text-base-content'>{i18n.t('setting.security.autoLockTimeDescription')}</div>
          </div>
          <select id='auto-lock-time' class='select max-w-fit'>
            <option value='5'>5 {i18n.t('setting.time.minutes')}</option>
            <option value='10'>10 {i18n.t('setting.time.minutes')}</option>
            <option value='15'>15 {i18n.t('setting.time.minutes')}</option>
            <option value='30'>30 {i18n.t('setting.time.minutes')}</option>
            <option value='60'>1 {i18n.t('setting.time.hour')}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 界面设置 -->
    <div class='setting-section'>
      <h1 class='text-xl font-semibold text-base-content'>{i18n.t('setting.interface.title')}</h1>
      <div class='divider'></div>

      <div class='setting-content'>
        <div class='setting-item'>
          <div class='setting-label'>
            <div class='setting-title text-base-content'>{i18n.t('setting.interface.language')}</div>
            <div class='setting-description text-base-content'>{i18n.t('setting.interface.languageDescription')}</div>
          </div>
          <select id='language-select' class='select max-w-fit' onchange={handleLanguageChange}>
            <option value='zh'>中文</option>
            <option value='en'>English</option>
            <option value='ja'>日本語</option>
          </select>
        </div>

        <div class='setting-item'>
          <div class='setting-label'>
            <div class='setting-title text-base-content'>{i18n.t('setting.interface.theme')}</div>
            <div class='setting-description text-base-content'>{i18n.t('setting.interface.themeDescription')}</div>
          </div>
          <select id='theme-select' class='select max-w-fit'>
            <option value='auto'>{i18n.t('setting.interface.themeAuto')}</option>
            <option value='light'>{i18n.t('setting.interface.themeLight')}</option>
            <option value='dark'>{i18n.t('setting.interface.themeDark')}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 关于 -->
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
</div>
