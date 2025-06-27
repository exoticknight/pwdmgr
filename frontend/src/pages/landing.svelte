<script lang='ts'>
  import { FileText, Plus } from '@lucide/svelte'
  import ErrorAlert from '../components/error-alert.svelte'
  import PasswordForm from '../components/password-form.svelte'
  import WailsFileSelect from '../components/wails-file-select.svelte'
  import i18next from '../i18n'
  import { getDataManagerService } from '../services/data-manager'
  import { getDatabaseService } from '../services/database'
  import { userState } from '../stores/user.svelte'
  import { navigationService, Routes } from '../utils/navigation'

  let showPasswordInput = $state(false)
  let selectedFilePath = $state<string | null>(null)
  let isNewDatabase = $state(false)
  let password = $state('')
  let confirmPassword = $state('')
  let error = $state('')
  let isLoading = $state(false)

  const dataManager = getDataManagerService()

  function handleFileSelected(filePath: string) {
    error = ''
    isNewDatabase = false
    showPasswordInput = true
    selectedFilePath = filePath
  }

  function handleFilesSelected(filePaths: string[]) {
    if (filePaths.length > 0) {
      handleFileSelected(filePaths[0])
    }
  }

  function createNewDatabase() {
    isNewDatabase = true
    selectedFilePath = null
    showPasswordInput = true
    error = ''
  }

  async function handlePasswordSubmit(event: SubmitEvent) {
    event.preventDefault()
    if (!password) {
      error = i18next.t('errors.passwordRequired')
      return
    }

    if (isNewDatabase && password !== confirmPassword) {
      error = i18next.t('errors.passwordMismatch')
      return
    }

    await processDatabase()
  }

  async function processDatabase() {
    try {
      isLoading = true
      error = ''

      if (selectedFilePath) {
        // Load existing file with decryption validation
        await dataManager.loadFromFile(selectedFilePath, password)
        userState.dbPath = selectedFilePath
        userState.password = password
      }
      else if (isNewDatabase) {
        // Create new database by initializing with empty data
        const database = await getDatabaseService()
        await database.initialize() // Initialize with empty data
        userState.dbPath = ''
        userState.password = password
      }

      // If we reach here, operation was successful
      navigationService.navigate(Routes.TABLE)
    }
    catch (err) {
      console.error('Failed to process database:', err)
      error = String(err) || i18next.t('messages.loadDatabaseFileFailed')
    }
    finally {
      isLoading = false
    }
  }

  function resetState() {
    showPasswordInput = false
    selectedFilePath = null
    isNewDatabase = false
    password = ''
    confirmPassword = ''
    error = ''
  }

  const displayFileName = $derived(selectedFilePath ? selectedFilePath.split(/[/\\]/).pop() || '' : '')
</script>

<div class='min-h-screen bg-base-100 flex items-center justify-center p-8'>
  <div class='w-full max-w-lg'>
    {#if !showPasswordInput}
      <WailsFileSelect
        config={{
          dialog: {
            title: i18next.t('landing.dialogTitle'),
            filters: [
              { displayName: i18next.t('landing.passwordFiles'), pattern: '*.pwd' },
              { displayName: i18next.t('landing.dataFiles'), pattern: '*.dat' },
              { displayName: i18next.t('landing.allFiles'), pattern: '*.*' },
            ],
          },
          behavior: {
            mode: 'open',
            multiple: false,
            enableDrop: true,
            dropFilter: paths => paths.filter(path =>
              path.toLowerCase().endsWith('.pwd') || path.toLowerCase().endsWith('.dat'),
            ),
          },
          appearance: {
            containerClass: 'border-2 border-dashed border-base-300 rounded-lg p-8 text-center cursor-pointer transition-colors hover:border-primary hover:bg-base-200',
          },
        }}
        onSelect={handleFilesSelected}
      >
        {#snippet children({ isDragOver })}
          <div class='w-12 h-12 mx-auto mb-4 text-base-content/50'>
            <FileText class='w-full h-full' />
          </div>

          <h3 class='text-lg font-semibold mb-2'>
            {i18next.t('landing.selectFileTitle')}
          </h3>

          <p class='text-base-content/70 mb-4'>
            {i18next.t('landing.selectFileDescription')}
          </p>

          <div class='text-sm text-base-content/50 space-y-1'>
            <p>{i18next.t('landing.selectFileFormats')}</p>
            <p class='text-xs'>{i18next.t('landing.selectFileHint')}</p>
            {#if isDragOver}
              <p class='text-xs text-primary font-medium'>Release to select files</p>
            {/if}
          </div>
        {/snippet}
      </WailsFileSelect>

      <div class='divider my-6'>{i18next.t('actions.or')}</div>

      <button
        class='btn btn-primary w-full'
        onclick={createNewDatabase}
      >
        <Plus class='w-5 h-5 mr-2' />
        {i18next.t('actions.createNew')}
      </button>

      <ErrorAlert {error} />
    {:else}
      <PasswordForm
        {isNewDatabase}
        selectedFile={{ name: displayFileName } as File}
        bind:password
        bind:confirmPassword
        {error}
        {isLoading}
        onSubmit={handlePasswordSubmit}
        onReset={resetState}
      />
    {/if}
  </div>
</div>
