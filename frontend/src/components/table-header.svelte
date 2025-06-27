<script lang='ts'>
  import { ArrowLeft, Plus, Save, Search } from '@lucide/svelte'
  import i18next from '../i18n'

  interface Props {
    hasUnsavedChanges: boolean
    searchTerm: string
    filteredCount: number
    totalCount: number
    onGoBack: () => void
    onSearchChange: (term: string) => void
    onAddNew: () => void
    onSave: () => void
  }

  let {
    hasUnsavedChanges,
    searchTerm = $bindable(),
    filteredCount,
    totalCount,
    onGoBack,
    onSearchChange,
    onAddNew,
    onSave,
  }: Props = $props()

  function handleSearchInput(event: Event) {
    const target = event.target as HTMLInputElement
    onSearchChange(target.value)
  }
</script>

<div class='border-b border-base-300 p-4'>
  <div class='max-w-6xl mx-auto flex items-center justify-between'>
    <!-- Left: Back button and info -->
    <div class='flex items-center gap-4'>
      <button
        class='btn btn-ghost btn-sm'
        class:btn-warning={hasUnsavedChanges}
        onclick={onGoBack}
        title={hasUnsavedChanges ? i18next.t('warnings.unsavedChanges') : i18next.t('actions.back')}
      >
        <ArrowLeft class='w-4 h-4' />
      </button>

      <!-- Info display -->
      <div class='text-sm text-base-content/70'>
        <span class='font-medium'>{filteredCount}</span>
        {filteredCount === 1 ? i18next.t('stats.entry') : i18next.t('stats.entries')}
        {#if searchTerm && filteredCount !== totalCount}
          <span class='text-base-content/50'>
            / {totalCount} {i18next.t('stats.total')}
          </span>
        {/if}
      </div>
    </div>

    <!-- Right: Search box and action buttons -->
    <div class='flex items-center gap-3'>
      <!-- Search box -->
      <label class='input input-sm w-64 flex'>
        <Search class='w-4 h-4 text-base-content/60' />
        <input
          type='search'
          class='grow'
          placeholder={i18next.t('search.placeholder')}
          value={searchTerm}
          oninput={handleSearchInput}
        />
      </label>

      <!-- Action buttons -->
      <button class='btn btn-primary btn-sm' onclick={onAddNew}>
        <Plus class='w-4 h-4 mr-2' />
        {i18next.t('actions.addNew')}
      </button>

      <button
        class='btn btn-secondary btn-sm'
        onclick={onSave}
        disabled={!hasUnsavedChanges}
        title={hasUnsavedChanges ? i18next.t('actions.save') : i18next.t('actions.allSaved')}
      >
        <Save class='w-4 h-4 mr-2' />
        {i18next.t('actions.save')}
      </button>
    </div>
  </div>
</div>
