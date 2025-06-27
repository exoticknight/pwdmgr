<script lang='ts'>
  import type { DatabaseService } from '../services/database'
  import type { PasswordEntry } from '../types/password'
  import { onMount } from 'svelte'
  import EmptyState from '../components/empty-state.svelte'
  import EntryModal from '../components/entry-modal.svelte'
  import EntryRow from '../components/entry-row.svelte'
  import TableHeader from '../components/table-header.svelte'
  import WailsFileSelect from '../components/wails-file-select.svelte'
  import i18next from '../i18n'
  import { getDataManagerService } from '../services/data-manager'
  import { getDatabaseService } from '../services/database'
  import { userState } from '../stores/user.svelte'
  import { navigationService, Routes } from '../utils/navigation'

  // Services
  let database = $state<DatabaseService | null>(null)
  const dataManager = getDataManagerService()

  // Modal state
  let showModal = $state(false)
  let editingEntry = $state<PasswordEntry | null>(null)

  // Loading state
  let isLoading = $state(true)
  let error = $state<string | null>(null)

  // Error auto-dismiss timer
  let errorTimer: number | null = null

  // Save file dialog state
  let showSaveDialog = $state(false)

  // Search term binding
  let searchTerm = $state('')

  // Force reactive updates using subscription
  let updateTrigger = $state(0)

  // Local unsaved changes tracking
  let hasUnsavedChanges = $state(false)

  // Computed filtered entries and other derived states
  const filteredEntries = $derived.by(() => {
    if (!database) {
      return []
    }
    // Access updateTrigger and searchTerm to make this reactive
    void updateTrigger
    return database.getFilteredEntries(searchTerm)
  })
  const totalCount = $derived.by(() => {
    if (!database) {
      return 0
    }
    // Access updateTrigger to make this reactive to database changes
    void updateTrigger
    return database.getAllEntries().length
  })

  onMount(() => {
    try {
      // Get the already initialized database from the data manager
      database = getDatabaseService()

      if (!database) {
        throw new Error('Database not initialized')
      }

      // Subscribe to database changes to trigger reactive updates
      const unsubscribe = database.subscribe(() => {
        updateTrigger++
      })

      // Reset unsaved changes state when component mounts (file was just loaded)
      hasUnsavedChanges = false
      isLoading = false

      // Return cleanup function for component unmount
      return unsubscribe
    }
    catch (err) {
      console.error('Failed to initialize database:', err)
      setErrorWithAutoClose(i18next.t('messages.initializationFailed'))
      isLoading = false
    }
  })

  // Event handlers
  function handleGoBack() {
    if (hasUnsavedChanges) {
      // eslint-disable-next-line no-alert
      const confirmLeave = window.confirm(i18next.t('warnings.unsavedChanges'))
      if (!confirmLeave) {
        return
      }
    }

    // Close database connection
    if (database) {
      database.close()
    }

    // Clear user state and return to home page
    userState.dbPath = ''
    userState.password = ''

    navigationService.navigate(Routes.HOME)
  }

  function handleSearchChange(term: string) {
    searchTerm = term
  }

  function handleAddNew() {
    editingEntry = null
    showModal = true
  }

  async function handleSave() {
    if (!database || !hasUnsavedChanges) {
      return
    }

    try {
      const password = userState.password
      if (!password) {
        throw new Error(i18next.t('messages.noPasswordAvailable'))
      }

      // If there's a file path, save to file
      if (userState.dbPath) {
        await dataManager.saveToFile(database, userState.dbPath, password)
        hasUnsavedChanges = false
      }
      else {
        // New file, show save dialog
        showSaveDialog = true
      }
    }
    catch (err) {
      console.error('Failed to save database:', err)
      setErrorWithAutoClose(i18next.t('messages.saveFailed'))
    }
  }

  async function handleSaveLocationSelected(filePaths: string[]) {
    if (filePaths.length > 0 && database) {
      try {
        const filePath = filePaths[0]
        const password = userState.password
        if (!password) {
          throw new Error(i18next.t('messages.noPasswordAvailable'))
        }

        await dataManager.saveToFile(database, filePath, password)
        userState.dbPath = filePath
        hasUnsavedChanges = false
        showSaveDialog = false
      }
      catch (err) {
        console.error('Failed to save file:', err)
        setErrorWithAutoClose(i18next.t('messages.saveFileFailed'))
      }
    }
    else {
      // User cancelled save, just close dialog
      showSaveDialog = false
    }
  }

  function handleCancelSave() {
    // Cancel save, just close dialog
    showSaveDialog = false
  }

  function handleEditEntry(id: string) {
    if (!database) {
      return
    }

    const allEntries = database.getAllEntries()
    const entry = allEntries.find(e => e.id === id)
    if (entry) {
      editingEntry = entry
      showModal = true
    }
  }

  async function handleDeleteEntry(id: string) {
    if (!database) {
      return
    }

    // Show confirmation dialog
    // eslint-disable-next-line no-alert
    const confirmed = window.confirm(i18next.t('warnings.deleteEntry'))
    if (!confirmed) {
      return
    }

    try {
      database.deleteEntry(id)
      // Mark as having unsaved changes
      hasUnsavedChanges = true
    }
    catch (err) {
      console.error('Failed to delete entry:', err)
      setErrorWithAutoClose(i18next.t('messages.deleteEntryFailed'))
    }
  }

  async function handleModalSave(entryData: PasswordEntry | Omit<PasswordEntry, 'id'>) {
    if (!database) {
      return
    }

    try {
      if ('id' in entryData) {
        // Update existing entry
        database.updateEntry(entryData.id, entryData)
      }
      else {
        // Add new entry
        database.addEntry(entryData)
      }

      // Mark as having unsaved changes
      hasUnsavedChanges = true
      showModal = false
      editingEntry = null
    }
    catch (err) {
      console.error('Failed to save entry:', err)
      setErrorWithAutoClose(i18next.t('messages.saveEntryFailed'))
    }
  }

  function handleModalCancel() {
    showModal = false
    editingEntry = null
  }

  function handleCopyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
      .then(() => {
        // Show success notification temporarily
        const originalError = error
        setErrorWithAutoClose(i18next.t('notifications.copied'))
        setTimeout(() => {
          error = originalError
        }, 2000)
      })
      .catch(() => {
        setErrorWithAutoClose(i18next.t('notifications.copyFailed'))
      })
  }

  function setErrorWithAutoClose(message: string) {
    // Clear existing timer
    if (errorTimer) {
      clearTimeout(errorTimer)
    }

    error = message

    // Set auto-close timer for 5 seconds
    errorTimer = setTimeout(() => {
      error = null
      errorTimer = null
    }, 5000)
  }
</script>

<div class='min-h-screen bg-base-100'>
  <!-- Error Alert -->
  {#if error}
    <div class='toast toast-bottom toast-end'>
      <div class='alert alert-error'>
        <span class='text-white'>{error}</span>
      </div>
    </div>
  {/if}

  <TableHeader
    {hasUnsavedChanges}
    bind:searchTerm
    filteredCount={filteredEntries.length}
    {totalCount}
    onGoBack={handleGoBack}
    onSearchChange={handleSearchChange}
    onAddNew={handleAddNew}
    onSave={handleSave}
  />

  <!-- Main content area -->
  <div class='max-w-6xl mx-auto p-4'>
    {#if isLoading}
      <div class='flex justify-center items-center py-8'>
        <span class='loading loading-spinner loading-lg'></span>
      </div>
    {:else if filteredEntries.length === 0}
      <EmptyState isSearching={!!searchTerm} />
    {:else}
      <!-- Table -->
      <div class='overflow-x-auto'>
        <table class='table w-full'>
          <thead>
            <tr>
              <th>{i18next.t('table.title')}</th>
              <th>{i18next.t('table.username')}</th>
              <th>{i18next.t('table.password')}</th>
              <th>{i18next.t('table.url')}</th>
              <th>{i18next.t('table.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {#each filteredEntries as entry (entry.id)}
              <EntryRow
                {entry}
                onCopyUsername={() => handleCopyToClipboard(entry.username)}
                onCopyPassword={() => handleCopyToClipboard(entry.password)}
                onEdit={() => handleEditEntry(entry.id)}
                onDelete={() => handleDeleteEntry(entry.id)}
              />
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</div>

<!-- Entry Modal -->
<EntryModal
  isOpen={showModal}
  entry={editingEntry}
  onSave={handleModalSave}
  onCancel={handleModalCancel}
/>

<!-- Save File Dialog -->
{#if showSaveDialog}
  <div class='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
    <div class='bg-white rounded-lg p-6 max-w-md w-full mx-4'>
      <h3 class='text-lg font-semibold mb-4'>{i18next.t('dialogs.savePasswordFile')}</h3>
      <WailsFileSelect
        config={{
          dialog: {
            title: i18next.t('dialogs.savePasswordFile'),
            defaultFilename: 'passwords.pwd',
            filters: [
              { displayName: 'Password Files (*.pwd)', pattern: '*.pwd' },
            ],
            canCreateDirs: true,
          },
          behavior: {
            mode: 'save',
            enableDrop: false,
          },
          appearance: {
            containerClass: 'border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer transition-colors hover:border-blue-500',
          },
        }}
        onSelect={handleSaveLocationSelected}
      >
        {#snippet children({ mode: _mode })}
          <div class='w-12 h-12 mx-auto mb-4 text-gray-400'>
            <svg fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4'></path>
            </svg>
          </div>

          <h4 class='text-lg font-semibold mb-2'>
            {i18next.t('dialogs.saveLocation')}
          </h4>

          <p class='text-gray-600 mb-4'>
            {i18next.t('dialogs.saveDescription')}
          </p>

          <p class='text-sm text-gray-500'>
            {i18next.t('dialogs.saveHint')}
          </p>
        {/snippet}
      </WailsFileSelect>
      <div class='mt-4 flex justify-end gap-2'>
        <button
          class='btn btn-ghost'
          onclick={handleCancelSave}
        >
          {i18next.t('dialogs.cancel')}
        </button>
      </div>
    </div>
  </div>
{/if}
