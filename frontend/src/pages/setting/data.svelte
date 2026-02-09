<script lang='ts'>
  import { i18n } from '@/stores/i18n.svelte'
  import ExportModal from './export-modal.svelte'
  import SettingItem from './setting-item.svelte'
  import SettingSection from './setting-section.svelte'
  import SettingsTransferModal from './settings-transfer-modal.svelte'

  let showExportDialog = $state(false)
  let showSettingsTransferDialog = $state(false)
  let transferMode: 'export' | 'import' = $state('export')

  function handleExport() {
    showExportDialog = true
  }

  function handleExportSettings() {
    transferMode = 'export'
    showSettingsTransferDialog = true
  }

  function handleImportSettings() {
    transferMode = 'import'
    showSettingsTransferDialog = true
  }

  function handleCloseExportModal() {
    showExportDialog = false
  }

  function handleCloseSettingsTransferModal() {
    showSettingsTransferDialog = false
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

    <SettingItem
      title={i18n.t('setting.data.importSettings.title')}
      description={i18n.t('setting.data.importSettings.description')}
    >
      {#snippet control()}
        <button
          class='btn btn-outline'
          onclick={handleImportSettings}
        >
          {i18n.t('setting.data.importSettings.buttonText')}
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

{#if showSettingsTransferDialog}
  <SettingsTransferModal
    isOpen={showSettingsTransferDialog}
    mode={transferMode}
    onClose={handleCloseSettingsTransferModal}
  />
{/if}
