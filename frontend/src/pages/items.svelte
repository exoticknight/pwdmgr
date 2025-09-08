<script lang='ts'>
  import type { BasicData, Datum, OmitBasicDataExcept } from '@/types/data'

  import { Info } from '@lucide/svelte'

  import SplitPanel from '@/components/split-panel.svelte'

  import { app } from '@/stores/app.svelte'
  import { data } from '@/stores/data.svelte'
  import { database } from '@/stores/database.svelte'
  import { i18n } from '@/stores/i18n.svelte'
  import { notification } from '@/stores/notification.svelte'
  import { userState } from '@/stores/user.svelte'

  import { compareISO8601String } from '@/utils/iso8601-compare'

  import TwoFactorNewModal from './items/2fa/2fa-new-modal.svelte'
  import EncryptedTextNewModal from './items/encrypted-text/encrypted-text-new-modal.svelte'
  import EntriesList from './items/entries-list.svelte'
  import EntryDetailPanel from './items/entry-detail-panel.svelte'
  import PasswordNewModal from './items/password/password-new-modal.svelte'
  import SaveFileModal from './items/save-file-modal.svelte'
  import TopToolbar from './items/top-toolbar.svelte'

  const { filter }: { filter: string } = $props()

  let leftPanelWidth = $state(35) // percentage
  let searchTerm = $state('')
  let selectedEntry = $state<Datum | null>(null)

  let showModal = $state(false)
  let currentEntryType = $state<BasicData['_type']>('password')
  let showSaveDialog = $state(false)

  const filteredEntries = $derived.by(() => {
    switch (filter) {
      case 'favorites':
        return data.searchEntries(searchTerm).filter(entry => entry._isFavorite)
      case 'recent':
        return data.searchEntries(searchTerm).toSorted((a, b) => {
          return compareISO8601String(b._lastUsedAt, a._lastUsedAt)
        })
      case 'password':
        return data.searchEntries(searchTerm).filter(entry => entry._type === 'password')
      case 'text':
        return data.searchEntries(searchTerm).filter(entry => entry._type === 'encrypted_text')
      case '2fa':
        return data.searchEntries(searchTerm).filter(entry => entry._type === 'two_factor_auth')
      default:
        return data.searchEntries(searchTerm)
    }
  })

  function handleNewEntry(entryType: BasicData['_type']) {
    currentEntryType = entryType
    showModal = true
  }

  async function handleSave() {
    if (!app.hasDataUnsavedChanges) {
      return
    }

    try {
      if (userState.dbPath) {
        database.commitData()
        await database.saveToFile(userState.dbPath)
        app.markDataAsSaved()
        notification.success(i18n.t('notifications.saved'))
      }
      else {
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

    try {
      userState.dbPath = filePath

      database.commitData()
      await database.saveToFile(filePath)

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
</script>

<div class='relative h-screen flex flex-col'>
  <TopToolbar
    {searchTerm}
    onNew={handleNewEntry}
    onSearch={handleSearch}
  />

  <div class='flex-1 flex overflow-hidden'>
    <SplitPanel
      initialLeftWidth={leftPanelWidth}
      resizerWidth={2}
      onResize={handleResize}
    >
      {#snippet left()}
        <div class='sidebar'>
          <EntriesList
            entries={filteredEntries}
            selectedId={selectedEntry?._id}
            onSelect={handleEntrySelect}
          />
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

{#if showModal && currentEntryType === 'two_factor_auth'}
  <TwoFactorNewModal
    isOpen={showModal}
    onCancel={handleNewModalCancel}
    onSave={handleNewModalSave}
  />
{/if}

{#if showSaveDialog}
  <SaveFileModal
    isOpen={showSaveDialog}
    onSave={handleSaveDialogSave}
    onCancel={handleSaveDialogCancel}
  />
{/if}

<style>
  .sidebar {
    height: 100%;
    display: grid;
    grid-row: 1fr;
    grid-column: 1fr;
  }

  .main-content {
    height: 100%;
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
