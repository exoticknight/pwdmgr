<script lang='ts'>
  import { Info, Settings } from '@lucide/svelte'
  import { app } from '@/stores/app.svelte'
  import { database } from '@/stores/database.svelte'
  import { i18n } from '@/stores/i18n.svelte'
  import { notification } from '@/stores/notification.svelte'
  import { userState } from '@/stores/user.svelte'

  import {
    AboutSection,
    DataSection,
    InterfaceSection,
    SecuritySection,
  } from './setting'

  const hasDataFile = $derived(!!userState.dbPath)

  async function handleSaveSettings() {
    try {
      // throw error because setting only be shown when dbpath exists
      if (!hasDataFile) {
        throw new Error('No database file path available')
      }

      database.commitSetting()
      await database.saveToFile(userState.dbPath)

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
        <DataSection />
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
    border-radius: 0%;
    transform: translateY(100%);
    transition: transform 0.3s ease-in-out;
  }

  .save-alert-show {
    transform: translateY(0);
  }
</style>
