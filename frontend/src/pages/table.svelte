<script lang='ts'>
  import type { PasswordEntry } from '../types/password'
  import { onMount } from 'svelte'
  import EmptyState from '../components/empty-state.svelte'
  import PasswordEntryRow from '../components/password-entry-row.svelte'
  import TableHeader from '../components/table-header.svelte'
  import i18next from '../i18n'
  import { PasswordManager } from '../stores/password.svelte'
  import { userState } from '../stores/user.svelte'
  import { navigationService, Routes } from '../utils/navigation'

  // Initialize password manager
  const passwordManager = new PasswordManager()

  onMount(() => {
    // TODO: Load password data from backend
    // Using mock data for now
    const mockData: PasswordEntry[] = [
      {
        id: '1',
        title: 'Gmail',
        username: 'user@gmail.com',
        password: 'password123',
        url: 'https://gmail.com',
        notes: 'Personal email account',
      },
      {
        id: '2',
        title: 'GitHub',
        username: 'developer',
        password: 'securepass456',
        url: 'https://github.com',
        notes: 'Development account',
      },
    ]
    passwordManager.setEntries(mockData)
  })

  // Event handlers
  function handleGoBack() {
    if (passwordManager.hasUnsavedChanges) {
      // eslint-disable-next-line no-alert
      const confirmLeave = window.confirm(i18next.t('warnings.unsavedChanges'))
      if (!confirmLeave) {
        return
      }
    }

    // Clear user state and return to home page
    userState.dbPath = ''
    userState.password = ''
    userState.dbData = null
    userState.isNewDatabase = false

    navigationService.navigate(Routes.HOME)
  }

  function handleSearchChange(term: string) {
    passwordManager.setSearchTerm(term)
  }

  function handleAddNew() {
    // TODO: Implement add new entry functionality
    // eslint-disable-next-line no-console
    console.log('Add new entry')
  }

  function handleSave() {
    if (!passwordManager.hasUnsavedChanges) {
      return
    }

    // TODO: Implement save functionality to persist current data
    // eslint-disable-next-line no-console
    console.log('Save data to:', userState.dbPath)

    // Clear unsaved changes flag after saving
    passwordManager.markAsSaved()
  }

  function handleEditEntry(id: string) {
    // TODO: Implement edit functionality
    // eslint-disable-next-line no-console
    console.log('Edit entry:', id)
  }

  function handleDeleteEntry(id: string) {
    // TODO: Implement delete functionality
    // eslint-disable-next-line no-console
    console.log('Delete entry:', id)
  // passwordManager.deleteEntry(id)
  }

  function handleCopyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
  // TODO: Show copy success notification
  }
</script>

<div class='min-h-screen bg-base-100'>
  <TableHeader
    hasUnsavedChanges={passwordManager.hasUnsavedChanges}
    bind:searchTerm={passwordManager.searchTerm}
    filteredCount={passwordManager.filteredEntries.length}
    totalCount={passwordManager.entries.length}
    onGoBack={handleGoBack}
    onSearchChange={handleSearchChange}
    onAddNew={handleAddNew}
    onSave={handleSave}
  />

  <!-- Main content area -->
  <div class='max-w-6xl mx-auto p-4'>
    {#if passwordManager.filteredEntries.length === 0}
      <EmptyState isSearching={!!passwordManager.searchTerm} />
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
            {#each passwordManager.filteredEntries as entry (entry.id)}
              <PasswordEntryRow
                {entry}
                showPassword={passwordManager.showPasswords[entry.id] || false}
                onTogglePassword={() => passwordManager.togglePasswordVisibility(entry.id)}
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
