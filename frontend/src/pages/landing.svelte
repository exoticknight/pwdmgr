<script lang='ts'>
  import type { DataFile } from '@/types/datafile'

  import { FileLock, Plus } from '@lucide/svelte'

  import LanguageSelector from '@/components/language-selector.svelte'
  import WailsFileSelect from '@/components/wails-file-select.svelte'

  import { getDataManager } from '@/services/data-manager'

  import { database } from '@/stores/database.svelte'
  import { i18n } from '@/stores/i18n.svelte'
  import { navigation } from '@/stores/navigation.svelte'
  import { notification } from '@/stores/notification.svelte'

  import { route, Routes } from '@/stores/route.svelte'
  import { userState } from '@/stores/user.svelte'
  import PasswordForm from './landing/password-form.svelte'

  let showPasswordInput = $state(false)
  let selectedFilePath = $state<string | null>(null)
  let isNewDatabase = $state(false)
  let password = $state('')
  let confirmPassword = $state('')
  let isLoading = $state(false)

  const dataManager = getDataManager()

  function handleFileSelected(filePath: string) {
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
  }

  async function handlePasswordSubmit(event: SubmitEvent) {
    event.preventDefault()
    if (!password) {
      notification.error(i18n.t('errors.passwordRequired'))
      return
    }

    if (isNewDatabase && password !== confirmPassword) {
      notification.error(i18n.t('errors.passwordMismatch'))
      return
    }

    await processDatabase()
  }

  async function processDatabase() {
    try {
      isLoading = true

      if (selectedFilePath) {
        const databaseFile = await dataManager.loadFromFile<DataFile>(selectedFilePath, password)
        database.close()
        await database.initialize(databaseFile)
        userState.dbPath = selectedFilePath
        userState.password = password
      }
      else if (isNewDatabase) {
        database.close()
        await database.initialize()
        userState.dbPath = ''
        userState.password = password
      }

      route.navigate(navigation.visibleItems.at(0)?.route || Routes.ITEMS_ALL)
    }
    catch (err) {
      console.error('Failed to process database:', err)
      notification.error(String(err) || i18n.t('messages.loadDatabaseFileFailed'))
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
  }

  const displayFileName = $derived(selectedFilePath ? selectedFilePath.split(/[/\\]/).pop() || '' : '')
</script>

<div class='landing-container'>
  <div class='landing-content'>
    {#if !showPasswordInput}
      <!-- Header Section -->
      <div class='landing-header'>
        <div class='app-icon'>
          <FileLock size={32} />
        </div>
        <h1 class='app-title'>{i18n.t('app.title')}</h1>
        <p class='app-subtitle'>{i18n.t('app.slogan')}</p>
      </div>

      <!-- File Selection -->
      <div class='file-section'>
        <WailsFileSelect
          class='file-drop-zone'
          title={i18n.t('landing.dialogTitle')}
          filters={[
            { displayName: i18n.t('landing.passwordFiles'), pattern: '*.pwd' },
            { displayName: i18n.t('landing.allFiles'), pattern: '*.*' },
          ]}
          mode='open'
          multiple={false}
          enableDrop={true}
          dropFilter={paths => paths.filter(path =>
            path.toLowerCase().endsWith('.pwd'),
          )}
          onSelect={handleFilesSelected}
        >
          {#snippet children()}
            <div class='file-drop-content'>
              <FileLock size={24} />
              <p class='file-drop-text'>{i18n.t('landing.selectFileDescription')}</p>
              <span class='file-drop-hint'>{i18n.t('landing.selectFileFormats')}</span>
            </div>
          {/snippet}
        </WailsFileSelect>

        <div class='divider-section'>
          <span class='divider-text'>{i18n.t('actions.or')}</span>
        </div>

        <button
          class='btn-new-database'
          onclick={createNewDatabase}
        >
          <Plus size={16} />
          {i18n.t('actions.createNew')}
        </button>
      </div>
    {:else}
      <PasswordForm
        {isNewDatabase}
        selectedFile={{ name: displayFileName } as File}
        bind:password
        bind:confirmPassword
        {isLoading}
        onSubmit={handlePasswordSubmit}
        onReset={resetState}
      />
    {/if}
  </div>
</div>

<!-- Language Selector - Fixed Position -->
<LanguageSelector />

<style>
  .landing-container {
    min-height: 100vh;
    background-color: var(--color-bg-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-lg);
  }

  .landing-content {
    width: 100%;
    max-width: 480px;
  }

  .landing-header {
    text-align: center;
    margin-bottom: var(--space-lg);
  }

  .app-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    background-color: var(--color-primary);
    color: white;
    border-radius: var(--radius-md);
    margin-bottom: var(--space-sm);
  }

  .app-title {
    font-size: var(--font-size-3xl);
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0 0 var(--space-sm) 0;
  }

  .app-subtitle {
    font-size: var(--font-size-base);
    color: var(--color-text-secondary);
    margin: 0;
    letter-spacing: 0.5px;
  }

  .file-section {
    background-color: var(--color-bg-secondary);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-md);
  }

  :global(.file-drop-zone) {
    border: 2px dashed var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-md);
    text-align: center;
    cursor: pointer;
    transition: border-color 0.2s ease;
    background-color: transparent;
  }

  :global(.file-drop-zone:hover) {
    border-color: var(--color-primary);
    background-color: var(--color-bg-tertiary);
  }

  .file-drop-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-sm);
  }

  .file-drop-text {
    font-size: var(--font-size-base);
    color: var(--color-text-primary);
    margin: 0;
  }

  .file-drop-hint {
    font-size: var(--font-size-sm);
    color: var(--color-text-muted);
  }

  .divider-section {
    display: flex;
    align-items: center;
    margin: var(--space-md) 0;
  }

  .divider-section::before,
  .divider-section::after {
    content: '';
    flex: 1;
    height: 1px;
    background-color: var(--color-border);
  }

  .divider-text {
    padding: 0 var(--space-md);
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    background-color: var(--color-bg-secondary);
  }

  .btn-new-database {
    width: 100%;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-sm);
    background-color: var(--color-primary);
    color: white;
    border: none;
    border-radius: var(--radius-md);
    font-size: var(--font-size-base);
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .btn-new-database:hover {
    background-color: var(--color-primary-hover);
  }

  .btn-new-database:active {
    transform: translateY(1px);
  }
</style>
