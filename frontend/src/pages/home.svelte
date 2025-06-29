<script lang='ts'>
  import type { DatabaseService } from '../services/database'
  import type { PasswordEntry } from '../types/password'
  import { onMount } from 'svelte'
  import EntriesList from '../components/entries-list.svelte'
  import EntryDetailPanel from '../components/entry-detail-panel.svelte'
  import EntryModal from '../components/entry-modal.svelte'
  import SaveFileDialog from '../components/save-file-dialog.svelte'
  import SidebarToolbar from '../components/sidebar-toolbar.svelte'
  import SplitPanel from '../components/split-panel.svelte'
  import i18next from '../i18n'
  import { getDataManagerService } from '../services/data-manager'
  import { getDatabaseService } from '../services/database'
  import { userState } from '../stores/user.svelte'
  import { navigationService, Routes } from '../utils/navigation'
  import { notifications } from '../utils/notifications'

  // Services
  let database = $state<DatabaseService | null>(null)
  const dataManager = getDataManagerService()

  // UI State
  let leftPanelWidth = $state(40) // percentage
  let searchTerm = $state('')
  let selectedEntry = $state<PasswordEntry | null>(null)
  let hasUnsavedChanges = $state(false)
  let isLoading = $state(true)

  // Modal state
  let showModal = $state(false)
  let editingEntry = $state<PasswordEntry | null>(null)
  let showSaveDialog = $state(false)

  // Force reactive updates
  let updateTrigger = $state(0)

  // Computed filtered entries
  const filteredEntries = $derived.by(() => {
    if (!database) {
      return []
    }
    void updateTrigger
    return database.getFilteredEntries(searchTerm)
  })

  // Initialize database
  onMount(async () => {
    try {
      database = await getDatabaseService()
      if (database) {
        // Subscribe to database changes
        database.subscribe(() => {
          updateTrigger += 1
        })
      }
    }
    catch {
      notifications.error(i18next.t('errors.databaseError'))
    }
    finally {
      isLoading = false
    }
  })

  // Handle navigation back
  function handleBack() {
    if (hasUnsavedChanges) {
      // eslint-disable-next-line no-alert
      const confirmed = window.confirm(i18next.t('errors.unsavedChanges'))
      if (!confirmed) {
        return
      }
    }
    navigationService.navigate(Routes.HOME)
  }

  // Handle new entry
  function handleNewEntry() {
    editingEntry = null
    showModal = true
  }

  // Handle save all changes
  async function handleSaveAll() {
    if (!database || !hasUnsavedChanges) {
      return
    }

    try {
      const password = userState.password
      if (!password) {
        throw new Error(i18next.t('errors.noPasswordAvailable'))
      }

      // If there's a file path, save to file
      if (userState.dbPath) {
        await dataManager.saveToFile(database, userState.dbPath, password)
        hasUnsavedChanges = false
        notifications.success(i18next.t('notifications.saved'))
      }
      else {
        // New file, show save dialog
        showSaveDialog = true
      }
    }
    catch (err) {
      console.error('Failed to save database:', err)
      notifications.error(i18next.t('errors.saveError'))
    }
  }

  // Handle entry selection
  function handleEntrySelect(data: { entry: PasswordEntry }) {
    selectedEntry = data.entry
  }

  // Handle resizing
  function handleResize(leftWidth: number) {
    leftPanelWidth = leftWidth
  }

  // Handle entry updates
  function handleEntryUpdate(data: { id: string, updates: Partial<PasswordEntry> }) {
    if (!database) {
      return
    }

    try {
      database.updateEntry(data.id, data.updates)
      // Update selected entry
      const updatedEntry = database.getAllEntries().find(e => e.id === data.id)
      if (updatedEntry) {
        selectedEntry = updatedEntry
      }
      updateTrigger += 1
      hasUnsavedChanges = true
    }
    catch {
      notifications.error(i18next.t('errors.updateError'))
    }
  }

  // Handle entry deletion
  function handleEntryDelete(data: { id: string }) {
    if (!database) {
      return
    }

    try {
      database.deleteEntry(data.id)
      selectedEntry = null
      updateTrigger += 1
      handleMarkDirty()
      notifications.success(i18next.t('notifications.entryDeleted'))
    }
    catch {
      notifications.error(i18next.t('errors.deleteError'))
    }
  }

  // Handle search
  function handleSearch(data: { term: string }) {
    searchTerm = data.term
  }

  // Handle marking dirty state
  function handleMarkDirty() {
    hasUnsavedChanges = true
  }

  // Handle modal entry save
  function handleModalSave(entry: PasswordEntry | Omit<PasswordEntry, 'id'>) {
    if (!database) {
      return
    }

    try {
      if (editingEntry) {
        // Update existing entry
        database.updateEntry(editingEntry.id, entry as Partial<PasswordEntry>)
        notifications.success(i18next.t('notifications.entryUpdated'))
      }
      else {
        // Add new entry
        const newEntry = database.addEntry(entry as Omit<PasswordEntry, 'id'>)
        selectedEntry = newEntry
        notifications.success(i18next.t('notifications.entryAdded'))
      }

      updateTrigger += 1
      hasUnsavedChanges = true
      showModal = false
      editingEntry = null
    }
    catch {
      notifications.error(i18next.t('errors.saveError'))
    }
  }

  // Handle modal cancel
  function handleModalCancel() {
    showModal = false
    editingEntry = null
  }

  // Handle save dialog
  function handleSaveDialogSave(filePaths: string[]) {
    if (!database || filePaths.length === 0) {
      return
    }

    const filePath = filePaths[0]
    const password = userState.password
    if (!password) {
      notifications.error(i18next.t('errors.noPasswordAvailable'))
      return
    }

    dataManager.saveToFile(database, filePath, password)
      .then(() => {
        userState.dbPath = filePath
        hasUnsavedChanges = false
        showSaveDialog = false
        notifications.success(i18next.t('notifications.saved'))
      })
      .catch((err) => {
        console.error('Failed to save file:', err)
        notifications.error(i18next.t('errors.saveError'))
      })
  }

  function handleSaveDialogCancel() {
    showSaveDialog = false
  }
</script>

{#if isLoading}
  <div class='h-screen flex items-center justify-center'>
    <div class='text-center'>
      <div class='loading loading-spinner loading-lg'></div>
      <p class='mt-4 text-base-content/60'>{i18next.t('common.loading')}</p>
    </div>
  </div>
{:else}
  <div class='h-screen'>
    <SplitPanel
      initialLeftWidth={leftPanelWidth}
      onResize={handleResize}
    >
      {#snippet left()}
        <div class='h-full flex flex-col bg-base-100'>
          <!-- Toolbar -->
          <SidebarToolbar
            {hasUnsavedChanges}
            onBack={handleBack}
            onNew={handleNewEntry}
            onSave={handleSaveAll}
          />

          <!-- Entries List -->
          <div class='flex-1 overflow-hidden'>
            <EntriesList
              entries={filteredEntries}
              selectedId={selectedEntry?.id}
              {searchTerm}
              onSelect={handleEntrySelect}
              onSearch={handleSearch}
            />
          </div>
        </div>
      {/snippet}

      {#snippet right()}
        <div class='h-full bg-base-50 flex flex-col'>
          <EntryDetailPanel
            entry={selectedEntry}
            onUpdate={handleEntryUpdate}
            onDelete={handleEntryDelete}
            onMarkDirty={handleMarkDirty}
          />
        </div>
      {/snippet}
    </SplitPanel>
  </div>

  <!-- Modals -->
  {#if showModal}
    <EntryModal
      entry={editingEntry}
      isOpen={showModal}
      onSave={handleModalSave}
      onCancel={handleModalCancel}
    />
  {/if}

  {#if showSaveDialog}
    <SaveFileDialog
      isOpen={showSaveDialog}
      onSave={handleSaveDialogSave}
      onCancel={handleSaveDialogCancel}
    />
  {/if}
{/if}
