<script lang='ts'>
  import type { ImportEntry } from './importers/types'
  import { File as FileIcon, FileJson, FileSpreadsheet } from '@lucide/svelte'
  import WailsFileSelect from '@/components/wails-file-select.svelte'
  import { getIoService } from '@/services/io'
  import { i18n } from '@/stores/i18n.svelte'
  import { notification } from '@/stores/notification.svelte'
  import { Bei3mat6Importer } from './importers/bei3mat6'
  import { BitwardenImporter } from './importers/bitwarden'
  import { KeePassImporter } from './importers/keepass'
  import { LastPassImporter } from './importers/lastpass'

  interface Props {
    onData: (importedData: ImportEntry[], errorCount: number) => void
  }

  const { onData }: Props = $props()

  let selectedFile: {
    name: string
    path: string
  } | null = $state(null)
  let fileContent: string = $state('')
  let isProcessing = $state(false)
  let selectedImportType = $state('bei3mat6')

  const importTypes = [
    {
      value: 'bei3mat6',
      label: 'bei3mat6 (JSON)',
      extension: '.json',
      importer: new Bei3mat6Importer(),
    },
    {
      value: 'bitwarden',
      label: 'Bitwarden',
      extension: '.json',
      importer: new BitwardenImporter(),
    },
    {
      value: 'keepass',
      label: 'KeePass',
      extension: '.xml',
      importer: new KeePassImporter(),
    },
    {
      value: 'lastpass',
      label: 'LastPass',
      extension: '.csv',
      importer: new LastPassImporter(),
    },
  ]

  const currentImportType = $derived(importTypes.find(type => type.value === selectedImportType) || importTypes[0])

  const handleFileSelect = async (filePaths: string[]) => {
    if (filePaths.length === 0) {
      return
    }

    const filePath = filePaths[0]
    const fileName = filePath.split(/[/\\]/).pop() || ''
    const expectedExtension = currentImportType.extension

    if (!fileName.toLowerCase().endsWith(expectedExtension)) {
      notification.error(i18n.t('import.errors.unsupportedFormat'))
      return
    }

    try {
      const contentBytes = await getIoService().readFile(filePath)
      const content = new TextDecoder('utf-8').decode(contentBytes)

      selectedFile = { name: fileName, path: filePath }
      fileContent = content
    }
    catch {
      notification.error(i18n.t('import.errors.openFailed'))
    }
  }

  const processImport = async () => {
    try {
      isProcessing = true

      const importer = currentImportType.importer
      const result = await importer.process(fileContent)

      if (!result.success) {
        const errorMessage = result.errors ? result.errors.join(', ') : i18n.t('import.errors.importFailed')
        notification.error(errorMessage)
        return
      }

      onData(result.entries, result.errors?.length || 0)

      selectedFile = null
      fileContent = ''
    }
    catch {
      notification.error(i18n.t('import.errors.importFailed'))
    }
    finally {
      isProcessing = false
    }
  }
</script>

<div class='flex flex-row gap-6 h-full'>
  <div class='flex-1 space-y-6'>
    <fieldset class='fieldset'>
      <legend class='fieldset-legend'>{i18n.t('import.importType')}</legend>
      <select
        id='import-type-select'
        class='select select-bordered w-full'
        bind:value={selectedImportType}
        onchange={() => {
          selectedFile = null
          fileContent = ''
        }}
        disabled={isProcessing}
      >
        {#each importTypes as importType}
          <option value={importType.value}>{importType.label}</option>
        {/each}
      </select>
    </fieldset>

    <div class='p-4 bg-info/10 rounded-lg border-l-4 border-info'>
      <h4 class='font-medium text-info mb-2'>{i18n.t('import.supportedFormat')}</h4>
      <p class='text-sm text-base-content/70'>
        {i18n.t('import.fileFormat', { extension: currentImportType.extension })}
      </p>
    </div>

    {#if currentImportType.value !== 'bei3mat6'}
      <div class='p-4 bg-warning/10 rounded-lg border-l-4 border-warning'>
        <h4 class='font-medium text-warning mb-2'>{i18n.t('import.instructions')}</h4>
        <p class='text-sm text-base-content/70'>
          {i18n.t(`import.fileTypes.${currentImportType.value}.instructions`)}
        </p>
      </div>
    {/if}
  </div>

  <!-- Right Side: File Selection Area -->
  <div class='flex-1'>
    {#if !selectedFile}
      <WailsFileSelect
        class='border-2 border-dashed border-base-300 rounded-lg p-6 text-center cursor-pointer transition-colors hover:border-primary h-full'
        title={i18n.t('import.fileSelection.selectFile')}
        filters={[
          {
            displayName: `${currentImportType.label} Files (*${currentImportType.extension})`,
            pattern: `*${currentImportType.extension}`,
          },
          { displayName: i18n.t('landing.allFiles'), pattern: '*.*' },
        ]}
        mode='open'
        multiple={false}
        enableDrop={true}
        dropFilter={paths => paths.filter(path => path.toLowerCase().endsWith(currentImportType.extension))}
        onSelect={handleFileSelect}
      >
        {#snippet children({ isDragOver })}
          <div class={`flex flex-col items-center justify-center gap-4 h-full ${isDragOver ? 'text-primary' : 'text-base-content/60'}`}>
            {#if currentImportType.extension === '.json'}
              <FileJson size={48} />
            {:else if currentImportType.extension === '.csv'}
              <FileSpreadsheet size={48} />
            {:else}
              <FileIcon size={48} />
            {/if}
            <div class='text-center'>
              <p class='font-medium text-lg mb-2'>
                {isDragOver ? i18n.t('import.fileSelection.dropHere') : i18n.t('import.fileSelection.clickOrDrag')}
              </p>
              <p class='text-sm'>
                {i18n.t('import.fileSelection.supportedFormats')}: {currentImportType.label} ({currentImportType.extension})
              </p>
            </div>
          </div>
        {/snippet}
      </WailsFileSelect>
    {:else}
      <div class='card bg-base-100 shadow-sm border border-base-300 h-full'>
        <div class='card-body'>
          {#if !isProcessing}
            <div class='flex items-center gap-3 mb-4'>
              <div class='w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center'>
                {#if currentImportType.extension === '.json'}
                  <FileJson size={24} class='text-primary' />
                {:else if currentImportType.extension === '.csv'}
                  <FileSpreadsheet size={24} class='text-primary' />
                {:else}
                  <FileIcon size={24} class='text-primary' />
                {/if}
              </div>
              <div>
                <h4 class='font-semibold'>{i18n.t('import.fileSelected')}</h4>
                <p class='text-sm text-base-content/70'>{i18n.t('import.readyToImport', { type: currentImportType.label })}</p>
              </div>
            </div>

            <div class='bg-base-200 rounded-lg p-4 space-y-2'>
              <p class='text-sm'><strong>{i18n.t('import.fileInfo.name')}:</strong> {selectedFile.name}</p>
              <p class='text-sm'><strong>{i18n.t('import.fileInfo.path')}:</strong> {selectedFile.path}</p>
              <p class='text-sm'><strong>{i18n.t('import.fileInfo.type')}:</strong> {currentImportType.label}</p>
            </div>

            <div class='flex-1'></div>

            <div class='card-actions justify-end mt-6'>
              <button
                class='btn btn-outline'
                onclick={() => {
                  selectedFile = null
                  fileContent = ''
                }}
              >
                {i18n.t('import.selectDifferentFile')}
              </button>
              <button
                class='btn btn-primary'
                onclick={processImport}
              >
                {i18n.t('import.startImport')}
              </button>
            </div>
          {:else}
            <div class='flex flex-col items-center justify-center py-12'>
              <span class='loading loading-spinner loading-lg mb-4'></span>
              <p class='text-lg font-medium'>{i18n.t('import.processing')}</p>
              <p class='text-sm text-base-content/70 mt-2'>{i18n.t('import.processingFile', { type: currentImportType.label })}</p>
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</div>
