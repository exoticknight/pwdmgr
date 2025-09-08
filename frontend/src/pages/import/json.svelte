<script lang='ts'>
  import type { OmitBasicDataExcept, PasswordData } from '@/types/data'
  import { Upload } from '@lucide/svelte'
  import WailsFileSelect from '@/components/wails-file-select.svelte'
  import { getIoService } from '@/services/io'
  import { data } from '@/stores/data.svelte'
  import { database } from '@/stores/database.svelte'
  import { i18n } from '@/stores/i18n.svelte'
  import { notification } from '@/stores/notification.svelte'

  let selectedFile: File | null = $state(null)
  let fileContent: string = $state('')
  let isProcessing = $state(false)

  const resetForm = () => {
    selectedFile = null
    fileContent = ''
    isProcessing = false
  }

  const handleFileSelect = async (filePaths: string[]) => {
    if (filePaths.length === 0) {
      return
    }

    const filePath = filePaths[0]
    const fileName = filePath.split(/[/\\]/).pop() || ''

    if (!fileName.toLowerCase().endsWith('.json')) {
      notification.error(i18n.t('import.errors.unsupportedFormat'))
      return
    }

    try {
      const contentBytes = await getIoService().readFile(filePath)
      const content = new TextDecoder('utf-8').decode(contentBytes)

      selectedFile = { name: fileName, size: content.length } as File
      fileContent = content
    }
    catch {
      notification.error(i18n.t('import.errors.openFailed'))
    }
  }

  const processImport = async () => {
    try {
      isProcessing = true
      const jsonData = JSON.parse(fileContent)

      if (!Array.isArray(jsonData)) {
        throw new TypeError(i18n.t('import.errors.invalidJsonFormat'))
      }

      let successCount = 0
      for (const item of jsonData) {
        if (typeof item === 'object' && item !== null) {
          const newEntry: OmitBasicDataExcept<PasswordData, 'TYPE'> = {
            _type: 'password' as const,
            title: item.title || item.name || 'Imported Entry',
            username: item.username || item.user || item.login || '',
            password: item.password || '',
            notes: item.notes || item.note || '',
            url: item.url || item.website || '',
          }
          data.addEntry(newEntry)
          successCount++
        }
      }

      database.commitData()
      notification.success(i18n.t('import.success', { count: successCount }))
      resetForm()
    }
    catch {
      notification.error(i18n.t('import.errors.importFailed'))
    }
    finally {
      isProcessing = false
    }
  }
</script>

<div class='mb-6'>
  <h3 class='text-lg font-semibold flex items-center gap-2 mb-2'>
    <Upload size={20} />
    {i18n.t('import.formats.json.title')}
  </h3>
  <p class='text-sm text-base-content/70'>{i18n.t('import.formats.json.description')}</p>
</div>

<div class='space-y-4'>
  {#if !selectedFile}
    <WailsFileSelect
      class='border-2 border-dashed border-base-300 rounded-lg p-6 text-center cursor-pointer transition-colors hover:border-primary'
      title={i18n.t('import.fileSelection.selectFile')}
      filters={[
        { displayName: 'JSON Files (*.json)', pattern: '*.json' },
        { displayName: i18n.t('landing.allFiles'), pattern: '*.*' },
      ]}
      mode='open'
      multiple={false}
      enableDrop={true}
      dropFilter={paths => paths.filter(path => path.toLowerCase().endsWith('.json'))}
      onSelect={handleFileSelect}
    >
      {#snippet children({ isDragOver })}
        <div class={`flex flex-col items-center gap-3 ${isDragOver ? 'text-primary' : 'text-base-content/60'}`}>
          <Upload size={32} />
          <div class='text-center'>
            <p class='font-medium'>
              {isDragOver ? i18n.t('import.fileSelection.dropHere') : i18n.t('import.fileSelection.clickOrDrag')}
            </p>
            <p class='text-sm mt-1'>
              {i18n.t('import.fileSelection.supportedFormats')}: JSON
            </p>
          </div>
        </div>
      {/snippet}
    </WailsFileSelect>
  {:else}
    <div class='card bg-base-100 shadow-sm border border-base-300'>
      <div class='card-body'>
        {#if !isProcessing}
          <div class='space-y-2'>
            <p class='text-sm'><strong>{i18n.t('import.fileInfo.name')}:</strong> {selectedFile.name}</p>
            <p class='text-sm'><strong>{i18n.t('import.fileInfo.size')}:</strong> {(selectedFile.size / 1024).toFixed(1)} KB</p>
          </div>

          <div class='card-actions justify-end mt-4'>
            <button
              class='btn btn-outline'
              onclick={resetForm}
            >
              {i18n.t('actions.cancel')}
            </button>
            <button
              class='btn btn-primary'
              onclick={processImport}
            >
              {i18n.t('import.startImport')}
            </button>
          </div>
        {:else}
          <div class='flex flex-col items-center justify-center py-8'>
            <span class='loading loading-spinner loading-lg mb-4'></span>
            <p class='text-lg font-medium'>{i18n.t('import.processing')}</p>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>
