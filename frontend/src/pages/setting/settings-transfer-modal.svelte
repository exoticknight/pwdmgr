<script lang='ts'>
  import type { Setting } from '@/types/setting'
  import { Download, FileUp, Info, TriangleAlert } from '@lucide/svelte'
  import Modal from '@/components/modal.svelte'
  import WailsFileSelect from '@/components/wails-file-select.svelte'
  import { getIoService } from '@/services/io'
  import { app } from '@/stores/app.svelte'
  import { i18n } from '@/stores/i18n.svelte'
  import { notification } from '@/stores/notification.svelte'
  import { setting } from '@/stores/setting.svelte'

  interface Props {
    isOpen: boolean
    mode: 'export' | 'import'
    onClose: () => void
    onImportSuccess?: () => void
  }

  const { isOpen, mode, onClose, onImportSuccess }: Props = $props()

  async function handleExportSave(filePaths: string[]) {
    if (filePaths.length === 0) {
      return
    }

    try {
      const filePath = filePaths[0]
      const settingsData = setting.export()
      const content = JSON.stringify(settingsData, null, 2)

      await getIoService().writeTextToFile(filePath, content)

      onClose()
      notification.success(i18n.t('notifications.settingsExportSuccess'))
    }
    catch (err) {
      console.error('Failed to export settings:', err)
      notification.error(i18n.t('errors.settingsExportError'))
    }
  }

  async function handleImportSelect(filePaths: string[]) {
    if (filePaths.length === 0) {
      return
    }

    try {
      const filePath = filePaths[0]
      const content = await getIoService().readFileAsText(filePath)
      const importedSettings = JSON.parse(content) as Setting

      // Validate imported settings structure
      if (!isValidSettings(importedSettings)) {
        throw new Error('Invalid settings file format')
      }

      // Reset and re-initialize to ensure complete replacement
      setting.reset()
      setting.initialize(importedSettings)

      // Apply settings immediately
      applySettings(importedSettings)

      // Mark settings as unsaved to trigger save notification
      app.markSettingAsUnsaved()

      onClose()
      notification.success(i18n.t('notifications.settingsImportSuccess'))
      onImportSuccess?.()
    }
    catch (err) {
      console.error('Failed to import settings:', err)
      notification.error(i18n.t('errors.settingsImportError'))
    }
  }

  function applySettings(settings: Setting) {
    // Apply language change immediately
    i18n.changeLanguage(settings.language.code)

    // Apply theme by setting data-theme attribute on document element
    applyTheme(settings.interface.theme)
  }

  function applyTheme(theme: string) {
    // Set data-theme attribute for DaisyUI theming
    document.documentElement.setAttribute('data-theme', theme)
  }

  function isValidSettings(data: unknown): boolean {
    if (typeof data !== 'object' || data === null) {
      return false
    }

    const settings = data as Record<string, unknown>

    // Check required top-level sections
    const requiredSections = ['interface', 'language', 'security']
    for (const section of requiredSections) {
      if (!(section in settings) || typeof settings[section] !== 'object' || settings[section] === null) {
        return false
      }
    }

    // Validate interface section
    const interface_ = settings.interface as Record<string, unknown>
    if (typeof interface_.theme !== 'string') {
      return false
    }
    if (typeof interface_.navigation !== 'object' || interface_.navigation === null) {
      return false
    }

    // Validate language section
    const language = settings.language as Record<string, unknown>
    if (typeof language.code !== 'string') {
      return false
    }

    // Validate security section
    const security = settings.security as Record<string, unknown>
    if (typeof security.autoLock !== 'boolean') {
      return false
    }
    if (typeof security.autoLockTime !== 'number') {
      return false
    }

    return true
  }
</script>

<Modal
  {isOpen}
  title={mode === 'export' ? i18n.t('setting.settingsTransfer.exportTitle') : i18n.t('setting.settingsTransfer.importTitle')}
  onClose={onClose}
  showCloseButton={true}
  boxClass='max-w-xl'
>
  {#snippet children()}
    <div class='settings-transfer-content'>
      <!-- Note -->
      <div class={mode === 'export' ? 'alert alert-info' : 'alert alert-warning'}>
        {#if mode === 'export'}
          <Info class='h-6 w-6' />
        {:else}
          <TriangleAlert class='h-6 w-6' />
        {/if}
        <span>
          {mode === 'export' ? i18n.t('setting.settingsTransfer.exportNote') : i18n.t('setting.settingsTransfer.importNote')}
        </span>
      </div>

      <!-- File Operation -->
      <div class='operation-section'>
        <h3 class='section-title'>
          {mode === 'export' ? i18n.t('setting.settingsTransfer.selectSaveLocation') : i18n.t('setting.settingsTransfer.selectFileToImport')}
        </h3>
        <WailsFileSelect
          class='border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer transition-colors hover:border-blue-500'
          title={mode === 'export' ? i18n.t('setting.settingsTransfer.export') : i18n.t('setting.settingsTransfer.import')}
          defaultFilename='bei3mat6-settings.json'
          filters={[
            { displayName: i18n.t('setting.settingsTransfer.jsonFiles'), pattern: '*.json' },
            { displayName: i18n.t('setting.settingsTransfer.allFiles'), pattern: '*.*' },
          ]}
          canCreateDirs={true}
          mode={mode === 'export' ? 'save' : 'open'}
          enableDrop={mode === 'import'}
          onSelect={mode === 'export' ? handleExportSave : handleImportSelect}
        >
          {#snippet children({ mode: _mode })}
            <div class='file-select-content'>
              <div class='file-select-icon'>
                {#if mode === 'export'}
                  <Download size={24} />
                {:else}
                  <FileUp size={24} />
                {/if}
              </div>
              <p class='file-select-text'>
                {mode === 'export' ? i18n.t('setting.settingsTransfer.clickToSave') : i18n.t('setting.settingsTransfer.clickToSelect')}
              </p>
              <p class='file-select-subtext'>
                {mode === 'export' ? i18n.t('setting.settingsTransfer.saveAsJson') : i18n.t('setting.settingsTransfer.selectJsonFile')}
              </p>
            </div>
          {/snippet}
        </WailsFileSelect>
      </div>
    </div>
  {/snippet}
</Modal>

<style>
  .settings-transfer-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
    min-width: 400px;
  }

  .operation-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .section-title {
    font-size: var(--font-size-md);
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0;
  }

  .file-select-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: var(--space-lg);
    gap: var(--space-xs);
  }

  .file-select-icon {
    color: var(--color-text-secondary);
  }

  .file-select-text {
    margin: 0;
    color: var(--color-text-primary);
    font-weight: 500;
  }

  .file-select-subtext {
    margin: 0;
    color: var(--color-text-secondary);
    font-size: var(--font-size-xs);
  }
</style>
