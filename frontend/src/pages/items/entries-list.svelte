<script lang='ts'>
  import type { Datum, EncryptedTextData, PasswordData } from '@/types/data'
  import { i18n } from '@/stores/i18n.svelte'

  interface Props {
    entries: Datum[]
    selectedId?: string
    onSelect?: (data: { entry: Datum }) => void
  }

  const { entries, selectedId, onSelect }: Props = $props()

  // Filter entries with title
  const filteredEntries = $derived.by(() => {
    return entries.filter(entry => entry.title)
  })

  function handleEntryClick(entry: Datum) {
    onSelect?.({ entry })
  }

  function handleKeydown(event: KeyboardEvent, entry: Datum) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleEntryClick(entry)
    }
  }

  function getSubtitleForEntry(entry: Datum): string {
    if (entry._type === 'password') {
      return (entry as PasswordData).username || ''
    }
    else if (entry._type === 'encrypted_text') {
      const content = (entry as EncryptedTextData).content
      return content ? content.substring(0, 50) + (content.length > 50 ? '...' : '') : ''
    }
    return ''
  }

  function getEntryTypeLabel(type: string): string {
    switch (type) {
      case 'password':
        return i18n.t('entryTypes.password')
      case 'encrypted_text':
        return i18n.t('entryTypes.encryptedText')
      default:
        return ''
    }
  }
</script>

<div class='entries-list'>
  <!-- Entries List -->
  <div class='list-container'>
    {#if filteredEntries.length === 0}
      <div class='empty-state'>
        {i18n.t('search.noResults')}
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
            <div class='item-header'>
              <div class='item-title'>{entry.title}</div>
              <div class='item-type'>{getEntryTypeLabel(entry._type)}</div>
            </div>
            <div class='item-subtitle'>{getSubtitleForEntry(entry)}</div>
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

  .item-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--space-sm);
  }

  .item-title {
    font-size: var(--font-size-base);
    font-weight: 500;
    color: inherit;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
  }

  .item-type {
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
    background: var(--color-bg-secondary);
    padding: 2px 6px;
    border-radius: var(--radius-xs);
    white-space: nowrap;
    flex-shrink: 0;
  }

  .list-item-selected .item-type {
    background: rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.9);
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
