<script lang='ts'>
  import type { PasswordEntry } from '../types/password'
  import { Key, Search } from '@lucide/svelte'
  import i18next from '../i18n'

  interface Props {
    entries: PasswordEntry[]
    selectedId?: string
    searchTerm?: string
    onSelect?: (data: { entry: PasswordEntry }) => void
    onSearch?: (data: { term: string }) => void
  }

  const { entries, selectedId, searchTerm = '', onSelect, onSearch }: Props = $props()

  // Group entries by first letter
  const groupedEntries = $derived.by(() => {
    const groups = new Map<string, PasswordEntry[]>()

    for (const entry of entries) {
      if (!entry.title) {
        continue
      }

      // Get first character and normalize it
      let firstChar = entry.title.charAt(0).toUpperCase()

      // For Chinese characters, we'll use a simple approach
      // In a real app, you might want to use a library like pinyin
      if (firstChar.match(/[\u4E00-\u9FFF]/)) {
        // Chinese character - for now, group under #
        firstChar = '#'
      }
      else if (!firstChar.match(/[A-Z]/)) {
        // Non-alphabetic character
        firstChar = '#'
      }

      if (!groups.has(firstChar)) {
        groups.set(firstChar, [])
      }
      groups.get(firstChar)!.push(entry)
    }

    // Sort groups by key and entries within groups by title
    const sortedGroups = new Map([...groups.entries()].sort())
    for (const [, groupEntries] of sortedGroups) {
      groupEntries.sort((a, b) => a.title.localeCompare(b.title))
    }

    return sortedGroups
  })

  function handleEntryClick(entry: PasswordEntry) {
    onSelect?.({ entry })
  }

  function handleSearchInput(event: Event) {
    const target = event.target as HTMLInputElement
    onSearch?.({ term: target.value })
  }
</script>

<div class='h-full flex flex-col'>
  <!-- Search Box -->
  <div class='p-2'>
    <label class='input'>
      <Search class='h-[1em] text-base-content/50' />
      <input
        type='text'
        placeholder={i18next.t('search.placeholder')}
        class='grow'
        value={searchTerm}
        oninput={handleSearchInput}
      />
    </label>
  </div>

  <!-- Divider -->
  <div class='border-b border-base-300' />

  <!-- Entries List -->
  <div class='flex-1 overflow-y-auto'>
    {#if groupedEntries.size === 0}
      <div class='p-2 text-center text-base-content/60'>
        {i18next.t('search.noResults')}
      </div>
    {:else}
      {#each [...groupedEntries.entries()] as [letter, groupEntries]}
        <div class='mb-4'>
          <!-- Group Header -->
          <div class='sticky top-0 bg-base-200 px-4 py-2 text-sm font-semibold text-base-content/80 border-b'>
            {letter}
          </div>

          <!-- Group Entries -->
          {#each groupEntries as entry}
            <button
              class='w-full p-3 text-left transition-colors border-b border-base-300 {selectedId === entry.id ? 'bg-primary/10 border-l-4 border-l-primary' : 'hover:bg-base-200'}'
              onclick={() => handleEntryClick(entry)}
            >
              <div class='flex items-center gap-3'>
                <div class='flex-1 min-w-0'>
                  <div class='font-medium text-base-content truncate'>
                    {entry.title}
                  </div>
                  {#if entry.notes}
                    <div class='text-sm text-base-content/60 mt-1 whitespace-pre-wrap line-clamp-2'>
                      {entry.notes}
                    </div>
                  {/if}
                </div>
              </div>
            </button>
          {/each}
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  /* Ensure proper scrolling behavior */
  :global(.entries-list) {
    scrollbar-width: thin;
  }

  /* Support for multi-line notes with line clamping */
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
