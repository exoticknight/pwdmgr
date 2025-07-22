<script lang='ts'>
  import { Braces, Download, FileText } from '@lucide/svelte'
  import Modal from '../../components/modal.svelte'
  import WailsFileSelect from '../../components/wails-file-select.svelte'
  import i18next from '../../i18n'

  interface Props {
    isOpen: boolean
    onExport: (format: 'csv' | 'json', filePaths: string[]) => void
    onCancel: () => void
  }

  const { isOpen, onExport, onCancel }: Props = $props()

  let selectedFormat: 'csv' | 'json' = $state('json')

  function handleFormatChange(format: 'csv' | 'json') {
    selectedFormat = format
  }

  function handleFileSave(filePaths: string[]) {
    onExport(selectedFormat, filePaths)
  }

  function getFileExtension() {
    return selectedFormat === 'csv' ? 'csv' : 'json'
  }

  function getDefaultFilename() {
    return `passwords.${getFileExtension()}`
  }

  function getFileFilters() {
    if (selectedFormat === 'csv') {
      return [
        { displayName: i18next.t('dialogs.csvFiles'), pattern: '*.csv' },
        { displayName: i18next.t('dialogs.allFiles'), pattern: '*.*' },
      ]
    }
    return [
      { displayName: i18next.t('dialogs.jsonFiles'), pattern: '*.json' },
      { displayName: i18next.t('dialogs.allFiles'), pattern: '*.*' },
    ]
  }
</script>

<Modal
  maxWidth='xl'
  {isOpen}
  title={i18next.t('dialogs.export')}
  onClose={onCancel}
  showCloseButton={true}
>
  {#snippet children()}
    <div class='export-modal-content'>
      <!-- Export Format Selection -->
      <div class='format-section'>
        <h3 class='section-title'>{i18next.t('dialogs.exportFormat')}</h3>
        <div class='format-options'>
          <button
            class={`format-option ${selectedFormat === 'json' ? 'selected' : ''}`}
            onclick={() => handleFormatChange('json')}
          >
            <Braces size={20} />
            <div class='format-info'>
              <div class='format-name'>JSON</div>
              <div class='format-desc'>{i18next.t('dialogs.exportJsonDesc')}</div>
            </div>
          </button>

          <button
            class={`format-option ${selectedFormat === 'csv' ? 'selected' : ''}`}
            onclick={() => handleFormatChange('csv')}
          >
            <FileText size={20} />
            <div class='format-info'>
              <div class='format-name'>CSV</div>
              <div class='format-desc'>{i18next.t('dialogs.exportCsvDesc')}</div>
            </div>
          </button>
        </div>
      </div>

      <!-- File Save Location -->
      <div class='location-section'>
        <h3 class='section-title'>{i18next.t('dialogs.exportLocation')}</h3>
        <WailsFileSelect
          class='border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer transition-colors hover:border-blue-500'
          config={{
            dialog: {
              title: i18next.t('dialogs.export'),
              defaultFilename: getDefaultFilename(),
              filters: getFileFilters(),
              canCreateDirs: true,
            },
            behavior: {
              mode: 'save',
              enableDrop: false,
            },
          }}
          onSelect={handleFileSave}
        >
          {#snippet children({ mode: _mode })}
            <div class='file-select-content'>
              <div class='file-select-icon'>
                <Download size={24} />
              </div>
              <p class='file-select-text'>
                {i18next.t('dialogs.selectSaveLocation')}
              </p>
              <p class='file-select-subtext'>
                {i18next.t('dialogs.saveAsFormat', { format: getFileExtension().toUpperCase() })}
              </p>
            </div>
          {/snippet}
        </WailsFileSelect>
      </div>
    </div>
  {/snippet}
</Modal>

<style>
  .export-modal-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
    min-width: 400px;
  }

  .format-section,
  .location-section {
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

  .format-options {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .format-option {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-sm);
    border: 2px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-bg-primary);
    cursor: pointer;
    transition: all 0.15s ease;
    text-align: left;
  }

  .format-option:hover {
    border-color: var(--color-primary);
    background: var(--color-primary-bg);
  }

  .format-option.selected {
    border-color: var(--color-primary);
    background: var(--color-primary-bg);
  }

  .format-info {
    flex: 1;
  }

  .format-name {
    font-weight: 600;
    color: var(--color-text-primary);
    font-size: var(--font-size-sm);
  }

  .format-desc {
    color: var(--color-text-secondary);
    font-size: var(--font-size-xs);
    margin-top: 2px;
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
