<script lang='ts'>
  import type { BasicData, Datum, OmitBasicDataExcept } from '@/types/data'

  import { Info } from '@lucide/svelte'

  import SplitPanel from '@/components/split-panel.svelte'

  import { getDataManager } from '@/services/data-manager'
  import { app } from '@/stores/app.svelte'

  import { data } from '@/stores/data.svelte'
  import { database } from '@/stores/database.svelte'
  import { i18n } from '@/stores/i18n.svelte'
  import { notification } from '@/stores/notification.svelte'
  import { userState } from '@/stores/user.svelte'

  import { exportToCSV, exportToJSON } from '@/utils/export'
  import { compareISO8601String } from '@/utils/iso8601-compare'

  import EncryptedTextNewModal from './items/encrypted-text/encrypted-text-new-modal.svelte'
  import EntriesList from './items/entries-list.svelte'
  import EntryDetailPanel from './items/entry-detail-panel.svelte'
  import ExportModal from './items/export-modal.svelte'
  import PasswordNewModal from './items/password/password-new-modal.svelte'
  import SaveFileModal from './items/save-file-modal.svelte'
  import TopToolbar from './items/top-toolbar.svelte'

  const { filter }: { filter: string } = $props()

  // Dependencies
  const dataManager = getDataManager()

  // UI State
  let leftPanelWidth = $state(35) // percentage
  let searchTerm = $state('')
  let selectedEntry = $state<Datum | null>(null)

  // Modal state
  let showModal = $state(false)
  let currentEntryType = $state<BasicData['_type']>('password')
  let showSaveDialog = $state(false)
  let showExportDialog = $state(false)

  // Computed filtered entries using the store
  const filteredEntries = $derived.by(() => {
    switch (filter) {
      case 'favorites':
        return data.searchEntries(searchTerm).filter(entry => entry._isFavorite)
      case 'recent':
        return data.searchEntries(searchTerm).toSorted((a, b) => {
          return compareISO8601String(b._lastUsedAt, a._lastUsedAt)
        })
      default:
        return data.searchEntries(searchTerm)
    }
  })

  function handleNewEntry(entryType: BasicData['_type']) {
    currentEntryType = entryType
    showModal = true
  }

  function handleExport() {
    showExportDialog = true
  }

  async function handleSave() {
    if (!app.hasDataUnsavedChanges) {
      return
    }

    try {
      const password = userState.password
      if (!password) {
        throw new Error(i18n.t('errors.noPasswordAvailable'))
      }

      // If there's a file path, save to file
      if (userState.dbPath) {
        const databaseData = database.commitData().export()
        await dataManager.saveToFile(userState.dbPath, password, databaseData)
        app.markDataAsSaved()
        notification.success(i18n.t('notifications.saved'))
      }
      else {
        // New file, show save dialog
        showSaveDialog = true
      }
    }
    catch (err) {
      console.error('Failed to save database:', err)
      notification.error(i18n.t('errors.saveError'))
    }
  }

  function handleEntrySelect(data: { entry: Datum }) {
    selectedEntry = data.entry
  }

  function handleResize(leftWidth: number) {
    leftPanelWidth = leftWidth
  }

  function handleEntryUpdate(entry: { id: string, updates: Partial<Datum> }) {
    try {
      const updatedEntry = data.updateEntry(entry.id, entry.updates)
      selectedEntry = updatedEntry
      app.markDataAsUnsaved()
    }
    catch {
      notification.error(i18n.t('errors.updateError'))
    }
  }

  function handleEntryDelete(entry: { id: string }) {
    try {
      data.deleteEntry(entry.id)
      selectedEntry = null
      app.markDataAsUnsaved()
      notification.success(i18n.t('notifications.entryDeleted'))
    }
    catch {
      notification.error(i18n.t('errors.deleteError'))
    }
  }

  function handleSearch(data: { term: string }) {
    searchTerm = data.term
  }

  function handleMarkDirty() {
    app.markDataAsUnsaved()
  }

  function handleNewModalSave(entry: OmitBasicDataExcept<Datum, 'TYPE'>) {
    try {
      const newEntry = data.addEntry(entry)
      selectedEntry = newEntry
      notification.success(i18n.t('notifications.entryAdded'))

      app.markDataAsUnsaved()
      showModal = false
    }
    catch {
      notification.error(i18n.t('errors.saveError'))
    }
  }

  function handleNewModalCancel() {
    showModal = false
  }

  async function handleSaveDialogSave(filePaths: string[]) {
    if (filePaths.length === 0) {
      return
    }

    const filePath = filePaths[0]
    const password = userState.password
    if (!password) {
      notification.error(i18n.t('errors.noPasswordAvailable'))
      return
    }

    try {
      const databaseData = database.commitData().export()
      await dataManager.saveToFile(filePath, password, databaseData)
      userState.dbPath = filePath
      app.markDataAsSaved()
      showSaveDialog = false
      notification.success(i18n.t('notifications.saved'))
    }
    catch (error) {
      console.error('Failed to save database:', error)
      notification.error(i18n.t('errors.saveError'))
    }
  }

  function handleSaveDialogCancel() {
    showSaveDialog = false
  }

  async function handleExportData(format: 'csv' | 'json', filePaths: string[]) {
    if (filePaths.length === 0) {
      return
    }

    try {
      const filePath = filePaths[0]
      let content: string

      const databaseData = database.export()

      if (format === 'csv') {
        content = exportToCSV(databaseData)
      }
      else {
        content = exportToJSON(databaseData)
      }

      await dataManager.saveToFileWithoutPassword(filePath, content)

      showExportDialog = false
      notification.success(i18n.t('notifications.exportSuccess'))
    }
    catch (err) {
      console.error('Failed to export data:', err)
      notification.error(i18n.t('errors.exportError'))
    }
  }

  function handleExportCancel() {
    showExportDialog = false
  }
</script>

<div class='relative h-screen flex flex-col'>
  <TopToolbar
    {searchTerm}
    onNew={handleNewEntry}
    onSearch={handleSearch}
    onExport={handleExport}
  />

  <div class='flex-1 flex overflow-hidden'>
    <SplitPanel
      initialLeftWidth={leftPanelWidth}
      onResize={handleResize}
    >
      {#snippet left()}
        <div class='sidebar'>
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

  <div
    role='alert'
    class='absolute w-full bottom-0 alert alert-error alert-soft save-alert'
    class:save-alert-show={app.hasDataUnsavedChanges}
  >
    <Info class='h-4 w-4 stroke-error' />
    <p class='text-lg'>{i18n.t('setting.unsavedAlert.message')}</p>
    <div>
      <button class='btn btn-error text-white' onclick={handleSave}>{i18n.t('setting.unsavedAlert.saveButton')}</button>
    </div>
  </div>
</div>

<!-- Modals -->
{#if showModal && currentEntryType === 'password'}
  <PasswordNewModal
    isOpen={showModal}
    onSave={handleNewModalSave}
    onCancel={handleNewModalCancel}
  />
{/if}

{#if showModal && currentEntryType === 'encrypted_text'}
  <EncryptedTextNewModal
    isOpen={showModal}
    onSave={handleNewModalSave}
    onCancel={handleNewModalCancel}
  />
{/if}

{#if showSaveDialog}
  <SaveFileModal
    isOpen={showSaveDialog}
    onSave={handleSaveDialogSave}
    onCancel={handleSaveDialogCancel}
  />
{/if}

{#if showExportDialog}
  <ExportModal
    isOpen={showExportDialog}
    onExport={handleExportData}
    onCancel={handleExportCancel}
  />
{/if}

<style>
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

  .save-alert {
    border-radius: 0%;
    transform: translateY(100%);
    transition: transform 0.3s ease-in-out;
  }

  .save-alert-show {
    transform: translateY(0);
  }
</style>
