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
      const content = (entry as EncryptedTextData).notes
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
            <div class='item-figure'></div>
            <div class='item-text'>
              <div class='item-title'>{entry.title}</div>
              <div class='item-subtitle'>{getSubtitleForEntry(entry)}</div>
            </div>
            <div class='item-append'>
              <div class='badge badge-ghost'>{getEntryTypeLabel(entry._type)}</div>
            </div>
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
    padding: var(--space-sm);
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
    flex-direction: row;
    gap: var(--space-sm);
  }

  .item-figure {
    width: 40px;
    height: 40px;
    background-color: var(--color-bg-secondary);
    border-radius: var(--radius-sm);
  }

  .item-text {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .item-title {
    font-size: var(--text-xl);
    line-height: var(--text-xl--line-height);
    font-weight: 500;
    color: inherit;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .item-subtitle {
    font-size: var(--text-sm);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

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
