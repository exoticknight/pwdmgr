<script lang='ts'>
  import type { ImportEntry } from './importers/types'
  import type { OmitBasicDataExcept, PasswordData } from '@/types/data'
  import { Upload } from '@lucide/svelte'
  import WailsFileSelect from '@/components/wails-file-select.svelte'
  import { getIoService } from '@/services/io'
  import { data } from '@/stores/data.svelte'
  import { database } from '@/stores/database.svelte'
  import { i18n } from '@/stores/i18n.svelte'
  import { notification } from '@/stores/notification.svelte'

  interface Props {
    onData: (importedData: ImportEntry[], errorCount: number) => void
  }

  const { onData }: Props = $props()

  let selectedFile: File | null = $state(null)
  let fileContent: string = $state('')
  let csvHeaders: string[] = $state([])
  let fieldMappings = $state<Record<string, string>>({
    title: '',
    username: '',
    password: '',
    notes: '',
    url: '',
  })
  let showMappingStep = $state(false)
  let isProcessing = $state(false)

  const resetForm = () => {
    selectedFile = null
    fileContent = ''
    csvHeaders = []
    showMappingStep = false
    isProcessing = false
    fieldMappings = {
      title: '',
      username: '',
      password: '',
      notes: '',
      url: '',
    }
  }

  const parseCSVHeaders = (csvContent: string): string[] => {
    const lines = csvContent.split('\n')
    if (lines.length === 0) {
      return []
    }

    const headerLine = lines[0].trim()
    return headerLine.split(',').map(header => header.replace(/"/g, '').trim())
  }

  const parseCSVContent = (content: string, mappings: Record<string, string>): any[] => {
    const lines = content.split('\n').filter(line => line.trim())
    if (lines.length <= 1) {
      return []
    }

    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim())
    const items = lines.slice(1).map((line) => {
      const values = line.split(',').map(v => v.replace(/"/g, '').trim())
      const item: any = {}
      headers.forEach((header, index) => {
        item[header] = values[index] || ''
      })
      return item
    })

    // 映射字段
    return items.map(item => ({
      title: item[mappings.title] || '',
      username: item[mappings.username] || '',
      password: item[mappings.password] || '',
      notes: item[mappings.notes] || '',
      url: item[mappings.url] || '',
    }))
  }

  const handleFileSelect = async (filePaths: string[]) => {
    if (filePaths.length === 0) {
      return
    }

    const filePath = filePaths[0]
    const fileName = filePath.split(/[/\\]/).pop() || ''

    if (!fileName.toLowerCase().endsWith('.csv')) {
      notification.error(i18n.t('import.errors.unsupportedFormat'))
      return
    }

    try {
      // Read file using IO service
      const contentBytes = await getIoService().readFile(filePath)
      const content = new TextDecoder('utf-8').decode(contentBytes)

      selectedFile = { name: fileName, size: content.length } as File
      fileContent = content
      csvHeaders = parseCSVHeaders(content)
    }
    catch {
      notification.error(i18n.t('import.errors.openFailed'))
    }
  }

  const startMapping = () => {
    showMappingStep = true
  }

  const processImport = async () => {
    if (!selectedFile || !database.initialized || !fileContent) {
      notification.error(i18n.t('import.errors.openFailed'))
      return
    }

    try {
      isProcessing = true
      const items = parseCSVContent(fileContent, fieldMappings)

      let successCount = 0
      for (const item of items) {
        if (item.title || item.username || item.password) {
          const newEntry: OmitBasicDataExcept<PasswordData, 'TYPE'> = {
            _type: 'password' as const,
            title: item.title || 'Imported Entry',
            username: item.username || '',
            password: item.password || '',
            notes: item.notes || '',
            url: item.url || '',
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
    {i18n.t('import.formats.csv.title')}
  </h3>
  <p class='text-sm text-base-content/70'>{i18n.t('import.formats.csv.description')}</p>
</div>

<div class='space-y-4'>
  {#if !selectedFile}
    <WailsFileSelect
      class='border-2 border-dashed border-base-300 rounded-lg p-6 text-center cursor-pointer transition-colors hover:border-primary'
      title={i18n.t('import.fileSelection.selectFile')}
      filters={[
        { displayName: 'CSV Files (*.csv)', pattern: '*.csv' },
        { displayName: i18n.t('landing.allFiles'), pattern: '*.*' },
      ]}
      mode='open'
      multiple={false}
      enableDrop={true}
      dropFilter={paths => paths.filter(path => path.toLowerCase().endsWith('.csv'))}
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
              {i18n.t('import.fileSelection.supportedFormats')}: CSV
            </p>
          </div>
        </div>
      {/snippet}
    </WailsFileSelect>
  {:else if !showMappingStep}
    <div class='card bg-base-100 shadow-sm border border-base-300'>
      <div class='card-body'>
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
            onclick={startMapping}
          >
            {i18n.t('import.mapping.title')}
          </button>
        </div>
      </div>
    </div>
  {:else}
    <div class='card bg-base-100 shadow-sm border border-base-300'>
      <div class='card-body'>
        {#if !isProcessing}
          <h3 class='card-title text-lg mb-4'>{i18n.t('import.mapping.title')}</h3>
          <p class='text-sm text-base-content/70 mb-4'>{i18n.t('import.mapping.description')}</p>

          <div class='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {#each Object.entries(fieldMappings) as [field, _]}
              <div class='form-control'>
                <label class='label' for='mapping-{field}'>
                  <span class='label-text'>{i18n.t(`import.mapping.${field}`)}</span>
                </label>
                <select
                  id='mapping-{field}'
                  class='select select-bordered'
                  bind:value={fieldMappings[field]}
                >
                  <option value=''>{i18n.t('import.mapping.columnName')}</option>
                  {#each csvHeaders as header}
                    <option value={header}>{header}</option>
                  {/each}
                </select>
              </div>
            {/each}
          </div>

          <div class='card-actions justify-end mt-6'>
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
