<script lang='ts'>
  import { i18n } from '@/stores/i18n.svelte'
  import { notification } from '@/stores/notification.svelte'
  import ExportModal from './export-modal.svelte'
  import SettingItem from './setting-item.svelte'
  import SettingSection from './setting-section.svelte'

  let showExportDialog = $state(false)

  function handleExport() {
    showExportDialog = true
  }

  function handleExportSettings() {
    // TODO: Implement settings export functionality
    notification.info(i18n.t('notifications.featureComingSoon'))
  }

  function handleCloseExportModal() {
    showExportDialog = false
  }
</script>

<SettingSection title={i18n.t('setting.data.title')}>
  {#snippet items(_markUnsaved: () => void)}
    <SettingItem
      title={i18n.t('setting.data.exportData.title')}
      description={i18n.t('setting.data.exportData.description')}
    >
      {#snippet control()}
        <button
          class='btn btn-outline'
          onclick={handleExport}
        >
          {i18n.t('setting.data.exportData.buttonText')}
        </button>
      {/snippet}
    </SettingItem>

    <SettingItem
      title={i18n.t('setting.data.exportSettings.title')}
      description={i18n.t('setting.data.exportSettings.description')}
    >
      {#snippet control()}
        <button
          class='btn btn-outline'
          onclick={handleExportSettings}
        >
          {i18n.t('setting.data.exportSettings.buttonText')}
        </button>
      {/snippet}
    </SettingItem>

  {/snippet}
</SettingSection>

{#if showExportDialog}
  <ExportModal
    isOpen={showExportDialog}
    onClose={handleCloseExportModal}
  />
{/if}
