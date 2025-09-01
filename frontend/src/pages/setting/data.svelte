<script lang='ts'>
  import { getIoService } from '@/services/io'
  import { database } from '@/stores/database.svelte'
  import { i18n } from '@/stores/i18n.svelte'
  import { notification } from '@/stores/notification.svelte'
  import { exportToCSV, exportToJSON } from '@/utils/export'
  import ExportModal from './export-modal.svelte'
  import SettingItem from './setting-item.svelte'
  import SettingSection from './setting-section.svelte'

  let showExportDialog = $state(false)

  function handleExport() {
    showExportDialog = true
  }

  async function handleExportData(format: 'csv' | 'json', filePaths: string[]) {
    if (filePaths.length === 0) {
      return
    }

    try {
      const filePath = filePaths[0]
      let content: string

      const databaseData = database.export()

      if (format === 'csv') {
        content = exportToCSV(databaseData)
      }
      else {
        content = exportToJSON(databaseData)
      }

      await getIoService().writeTextToFile(filePath, content)

      showExportDialog = false
      notification.success(i18n.t('notifications.exportSuccess'))
    }
    catch (err) {
      console.error('Failed to export data:', err)
      notification.error(i18n.t('errors.exportError'))
    }
  }

  function handleExportCancel() {
    showExportDialog = false
  }
</script>

<SettingSection title={i18n.t('setting.data.title')}>
  {#snippet items(_markUnsaved: () => void)}
    <SettingItem
      title={i18n.t('setting.data.export.title')}
      description={i18n.t('setting.data.export.description')}
    >
      {#snippet control()}
        <button
          class='btn btn-outline'
          onclick={handleExport}
        >
          {i18n.t('buttons.export')}
        </button>
      {/snippet}
    </SettingItem>
  {/snippet}
</SettingSection>

{#if showExportDialog}
  <ExportModal
    isOpen={showExportDialog}
    onExport={handleExportData}
    onCancel={handleExportCancel}
  />
{/if}
