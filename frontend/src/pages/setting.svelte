<script lang='ts'>
  import { Info, Settings } from '@lucide/svelte'
  import { getDataManager } from '@/services/data-manager'
  import { app } from '@/stores/app.svelte'
  import { database } from '@/stores/database.svelte'
  import { i18n } from '@/stores/i18n.svelte'
  import { notification } from '@/stores/notification.svelte'
  import { userState } from '@/stores/user.svelte'

  import {
    AboutSection,
    InterfaceSection,
    SecuritySection,
  } from './setting'

  const dataManager = getDataManager()

  const hasDataFile = $derived(!!userState.dbPath)

  async function handleSaveSettings() {
    try {
      const password = userState.password
      if (!password) {
        throw new Error(i18n.t('errors.noPasswordAvailable'))
      }

      if (!userState.dbPath) {
        throw new Error('No database file path available')
      }

      // Commit settings and export database
      database.commitSetting()
      const databaseData = database.export()

      // Save to file
      await dataManager.saveToFile(userState.dbPath, password, databaseData)

      // Mark as saved and show success notification
      app.markSettingAsSaved()
      notification.success(i18n.t('notifications.saved'))
    }
    catch (error) {
      console.error('Failed to save settings:', error)
      notification.error(i18n.t('errors.saveError'))
    }
  }
</script>

<div class='relative h-full'>
  {#if hasDataFile}
    <div class='overflow-y-auto h-full'>
      <div class='setting-container gap-8 m-4'>
        <SecuritySection />
        <InterfaceSection />
        <AboutSection />
      </div>
    </div>
  {:else}
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

  <div
    role='alert'
    class='absolute w-full bottom-0 alert alert-error alert-soft save-alert'
    class:save-alert-show={app.hasSettingUnsavedChanges}
  >
    <Info class='h-4 w-4 stroke-error' />
    <p class='text-lg'>{i18n.t('setting.unsavedAlert.message')}</p>
    <div>
      <button class='btn btn-error text-white' onclick={handleSaveSettings}>{i18n.t('setting.unsavedAlert.saveButton')}</button>
    </div>
  </div>
</div>

<style scoped>
  .setting-container {
    display: flex;
    flex-direction: column;
  }

  .save-alert {
    transform: translateY(100%);
    transition: transform 0.3s ease-in-out;
  }

  .save-alert-show {
    transform: translateY(0);
  }
</style>
