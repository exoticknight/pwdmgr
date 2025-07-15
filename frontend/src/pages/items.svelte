<script lang='ts'>
  import type { OmitBasicDataExcept, PasswordData } from '@/types/datafile'

  import SplitPanel from '@/components/split-panel.svelte'

  import i18next from '@/i18n'
  import { getDataManager } from '@/services/data-manager'

  import { database } from '@/stores/database.svelte'
  import { route, Routes } from '@/stores/route.svelte'
  import { userState } from '@/stores/user.svelte'
  import { DataMetaType } from '@/types/datafile'

  import { compareISO8601String } from '@/utils/iso8601-compare'

  import { notifications } from '@/utils/notifications'
  import EntriesList from './items/entries-list.svelte'
  import EntryDetailPanel from './items/entry-detail-panel.svelte'
  import NewEntryModal from './items/new-entry-modal.svelte'
  import SaveFileModal from './items/save-file-modal.svelte'
  import TopToolbar from './items/top-toolbar.svelte'

  const { filter }: { filter: string } = $props()

  // Dependencies
  const dataManager = getDataManager()

  // UI State
  let leftPanelWidth = $state(30) // percentage
  let searchTerm = $state('')
  let selectedEntry = $state<PasswordData | null>(null)
  let hasUnsavedChanges = $state(false)

  // Modal state
  let showModal = $state(false)
  let showSaveDialog = $state(false)

  // Computed filtered entries using the store
  const filteredEntries = $derived.by(() => {
    switch (filter) {
      case 'favorites':
        return database.searchEntries(searchTerm).filter(entry => entry._isFavorite)
      case 'recent':
        return database.searchEntries(searchTerm).toSorted((a, b) => {
          return compareISO8601String(b._lastUsedAt, a._lastUsedAt)
        })
      default:
        return database.searchEntries(searchTerm)
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
    route.navigate(Routes.LANDING)
  }

  // Handle new entry
  function handleNewEntry() {
    showModal = true
  }

  // Handle save all changes
  async function handleSaveAll() {
    if (!hasUnsavedChanges) {
      return
    }

    try {
      const password = userState.password
      if (!password) {
        throw new Error(i18next.t('errors.noPasswordAvailable'))
      }

      // If there's a file path, save to file
      if (userState.dbPath) {
        const databaseData = database.exportJSON()
        await dataManager.saveToFile(userState.dbPath, password, JSON.parse(databaseData))
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
  function handleEntrySelect(data: { entry: PasswordData }) {
    selectedEntry = data.entry
  }

  // Handle resizing
  function handleResize(leftWidth: number) {
    leftPanelWidth = leftWidth
  }

  // Handle entry updates
  function handleEntryUpdate(data: { id: string, updates: Partial<PasswordData> }) {
    try {
      const updatedEntry = database.updateEntry(data.id, data.updates)
      selectedEntry = updatedEntry
      hasUnsavedChanges = true
    }
    catch {
      notifications.error(i18next.t('errors.updateError'))
    }
  }

  // Handle entry deletion
  function handleEntryDelete(data: { id: string }) {
    try {
      database.deleteEntry(data.id)
      selectedEntry = null
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

  function handleModalSave(entry: OmitBasicDataExcept<PasswordData, 'TYPE'>) {
    try {
      const newEntry = database.addEntry(entry)
      selectedEntry = newEntry
      notifications.success(i18next.t('notifications.entryAdded'))

      hasUnsavedChanges = true
      showModal = false
    }
    catch {
      notifications.error(i18next.t('errors.saveError'))
    }
  }

  // Handle modal cancel
  function handleModalCancel() {
    showModal = false
  }

  // Handle save dialog
  function handleSaveDialogSave(filePaths: string[]) {
    if (filePaths.length === 0) {
      return
    }

    const filePath = filePaths[0]
    const password = userState.password
    if (!password) {
      notifications.error(i18next.t('errors.noPasswordAvailable'))
      return
    }

    const databaseData = database.exportJSON()
    dataManager.saveToFile(filePath, password, JSON.parse(databaseData))
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

<style>
  .app-layout {
    height: 100vh;
    background-color: var(--color-bg-primary);
    display: flex;
    flex-direction: column;
  }

  .main-layout {
    flex: 1;
    display: flex;
    overflow: hidden;
  }

  .sidebar {
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: var(--color-bg-secondary);
    border-right: 1px solid var(--color-border);
  }

  .sidebar-content {
    flex: 1;
    overflow: hidden;
  }

  .main-content {
    height: 100%;
    background-color: var(--color-bg-primary);
    display: flex;
    flex-direction: column;
  }

  .detail-content {
    flex: 1;
    overflow: hidden;
  }
</style>

<div class='app-layout'>
  <!-- Top Toolbar -->
  <TopToolbar
    {hasUnsavedChanges}
    {searchTerm}
    onBack={handleBack}
    onNew={handleNewEntry}
    onSave={handleSaveAll}
    onSearch={handleSearch}
  />

  <!-- Main Layout with Split Panel -->
  <div class='main-layout'>
    <SplitPanel
      initialLeftWidth={leftPanelWidth}
      onResize={handleResize}
    >
      {#snippet left()}
        <div class='sidebar'>
          <!-- Entries List -->
          <div class='sidebar-content'>
            <EntriesList
              entries={filteredEntries}
              selectedId={selectedEntry?._id}
              onSelect={handleEntrySelect}
            />
          </div>
        </div>
      {/snippet}

      {#snippet right()}
        <div class='main-content'>
          <!-- Detail Content -->
          <div class='detail-content'>
            <EntryDetailPanel
              entry={selectedEntry}
              onUpdate={handleEntryUpdate}
              onMarkDirty={handleMarkDirty}
              onDelete={handleEntryDelete}
            />
          </div>
        </div>
      {/snippet}
    </SplitPanel>
  </div>
</div>

<!-- Modals -->
{#if showModal}
  <NewEntryModal
    dataType={DataMetaType.PASSWORD}
    isOpen={showModal}
    onSave={handleModalSave}
    onCancel={handleModalCancel}
  />
{/if}

{#if showSaveDialog}
  <SaveFileModal
    isOpen={showSaveDialog}
    onSave={handleSaveDialogSave}
    onCancel={handleSaveDialogCancel}
  />
{/if}
