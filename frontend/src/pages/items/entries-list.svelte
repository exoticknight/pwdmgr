<script lang='ts'>
  import type { Datum, EncryptedTextData, PasswordData } from '@/types/data'
  import BrandIcon from '@/components/brand-icon.svelte'
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
    switch (entry._type) {
      case 'two_factor_auth':
        return entry.username || ''
      case 'password':
        return (entry as PasswordData).username || ''
      case 'encrypted_text': {
        const content = (entry as EncryptedTextData).notes
        return content ? content.substring(0, 50) + (content.length > 50 ? '...' : '') : ''
      }
      default:
        return ''
    }
  }

  function getEntryTypeLabel(type: string): string {
    switch (type) {
      case 'password':
        return i18n.t('entryTypes.password')
      case 'encrypted_text':
        return i18n.t('entryTypes.encryptedText')
      case 'two_factor_auth':
        return i18n.t('entryTypes.twoFactorAuth')
      default:
        return ''
    }
  }
</script>

<div class='entries-list h-full w-full overflow-y-auto'>
  {#if filteredEntries.length === 0}
    <div class='empty-state'>
      {i18n.t('search.noResults')}
    </div>
  {:else}
    <div class='w-full flex flex-col'>
      {#each filteredEntries as entry}
        <div
          class='list-item'
          class:list-item-selected={selectedId === entry._id}
          onclick={() => handleEntryClick(entry)}
          onkeydown={e => handleKeydown(e, entry)}
          role='button'
          tabindex='0'
        >
          <div class='item-figure'>
            <BrandIcon name={entry.title} size='2rem' />
          </div>
          <div class='item-text'>
            <div class='item-title'>{entry.title}</div>
            <div class='item-subtitle'>{getSubtitleForEntry(entry)}</div>
          </div>
          <div class='item-append'>
            <div class='badge badge-ghost badge-outline'>{getEntryTypeLabel(entry._type)}</div>
          </div>
        </div>
      {/each}
    </div>

  {/if}
</div>

<style scoped>
  .empty-state {
    padding: var(--space-lg);
    text-align: center;
    color: var(--color-text-muted);
    font-size: var(--font-size-base);
  }

  .list-item {
    width: 100%;
    padding: var(--space-sm);
    display: grid;
    grid-template-columns: auto 1fr auto;
    overflow: hidden;
    border: 5px solid transparent;
    cursor: pointer;
    transition: border-color 0.15s ease;
    background-color: var(--color-bg-primary);
  }

  .list-item:hover,
  .list-item-selected {
    background-color: color-mix(in oklab,var(--color-primary,var(--color-base-content))8%,var(--color-base-100));
    border-left-color: var(--color-primary);
  }

  .item-figure {
    width: 40px;
    height: 40px;
    display: grid;
    place-items: center;
    place-content: center;
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border);
    background-color: var(--color-base-100);
  }

  .item-text {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    padding: 0 var(--space-sm);
    overflow: hidden;
  }

  .item-title {
    font-size: var(--text-lg);
    line-height: var(--text-lg--line-height);
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

  .entries-list {
    scrollbar-width: thin;
    scrollbar-color: var(--color-border) transparent;
  }

  .entries-list::-webkit-scrollbar {
    width: 6px;
  }

  .entries-list::-webkit-scrollbar-track {
    background: transparent;
  }

  .entries-list::-webkit-scrollbar-thumb {
    background-color: var(--color-border);
    border-radius: 3px;
  }

  .entries-list::-webkit-scrollbar-thumb:hover {
    background-color: var(--color-text-muted);
  }
</style>
