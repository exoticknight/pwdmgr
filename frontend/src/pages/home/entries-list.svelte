<script lang='ts'>
  import type { PasswordData } from '../../types/datafile'
  import i18next from '../../i18n'

  interface Props {
    entries: PasswordData[]
    selectedId?: string
    onSelect?: (data: { entry: PasswordData }) => void
  }

  const { entries, selectedId, onSelect }: Props = $props()

  // Filter entries with title
  const filteredEntries = $derived.by(() => {
    return entries.filter(entry => entry.title)
  })

  function handleEntryClick(entry: PasswordData) {
    onSelect?.({ entry })
  }

  function handleKeydown(event: KeyboardEvent, entry: PasswordData) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleEntryClick(entry)
    }
  }
</script>

<div class='entries-list'>
  <!-- Entries List -->
  <div class='list-container'>
    {#if filteredEntries.length === 0}
      <div class='empty-state'>
        {i18next.t('search.noResults')}
      </div>
    {:else}
      {#each filteredEntries as entry}
        <div
          class='list-item {selectedId === entry._id ? 'list-item-selected' : ''}'
          onclick={() => handleEntryClick(entry)}
          onkeydown={e => handleKeydown(e, entry)}
          role='button'
          tabindex='0'
        >
          <div class='item-content'>
            <div class='item-title'>{entry.title}</div>
            <div class='item-subtitle'>{entry.username || ''}</div>
          </div>
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .entries-list {
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: var(--color-bg-primary);
  }

  .list-container {
    flex: 1;
    overflow-y: auto;
  }

  .empty-state {
    padding: var(--space-lg);
    text-align: center;
    color: var(--color-text-muted);
    font-size: var(--font-size-base);
  }

  .list-item {
    padding: var(--space-sm) var(--space-md);
    border-bottom: 1px solid var(--color-border-light);
    cursor: pointer;
    transition: background-color 0.15s ease;
    background-color: var(--color-bg-primary);
  }

  .list-item:hover:not(.list-item-selected) {
    background-color: var(--color-bg-secondary);
  }

  .list-item:focus {
    outline: none;
  }

  .list-item-selected {
    background-color: var(--color-primary);
    color: white;
    border-left: 3px solid var(--color-primary-hover);
  }

  .list-item-selected:hover {
    background-color: var(--color-primary-hover);
  }

  .list-item-selected .item-subtitle {
    color: rgba(255, 255, 255, 0.8);
  }

  .item-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .item-title {
    font-size: var(--font-size-base);
    font-weight: 500;
    color: inherit;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .item-subtitle {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Scrollbar styling */
  .list-container {
    scrollbar-width: thin;
    scrollbar-color: var(--color-border) transparent;
  }

  .list-container::-webkit-scrollbar {
    width: 6px;
  }

  .list-container::-webkit-scrollbar-track {
    background: transparent;
  }

  .list-container::-webkit-scrollbar-thumb {
    background-color: var(--color-border);
    border-radius: 3px;
  }

  .list-container::-webkit-scrollbar-thumb:hover {
    background-color: var(--color-text-muted);
  }
</style>
