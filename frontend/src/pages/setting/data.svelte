<script lang='ts'>
  import { app2FA } from '@/stores/app-2fa.svelte'
  import { i18n } from '@/stores/i18n.svelte'
  import { twoFAGate } from '@/stores/twofa-gate.svelte'
  import ExportModal from './export-modal.svelte'
  import SettingItem from './setting-item.svelte'
  import SettingSection from './setting-section.svelte'

  let showExportDialog = $state(false)

  async function handleExport() {
    if (app2FA.enabled) {
      const ok = await twoFAGate.verify()
      if (!ok)
        return
    }
    showExportDialog = true
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

  {/snippet}
</SettingSection>

{#if showExportDialog}
  <ExportModal
    isOpen={showExportDialog}
    onClose={handleCloseExportModal}
  />
{/if}
