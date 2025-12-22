<script lang='ts'>
  import type { Datum } from '@/types/data'
  import { Search } from '@lucide/svelte'

  import BrandIcon from '@/components/brand-icon.svelte'
  import Modal from '@/components/modal.svelte'
  import { data } from '@/stores/data.svelte'
  import { i18n } from '@/stores/i18n.svelte'
  import { getEntryTypeLabel } from '@/utils/entry-types'

  interface Props {
    isOpen: boolean
    currentId: string
    onClose?: () => void
    onLink?: (item: Datum) => void
  }

  const { isOpen, currentId, onClose, onLink }: Props = $props()

  const excludeIds = $derived.by(() => {
    const currentEntry = data.entries.find(e => e._id === currentId)
    if (!currentEntry)
      return [currentId]
    if (!currentEntry._clusterId)
      return [currentId]
    return [currentId, ...data.getClusterItems(currentEntry._clusterId).map(e => e._id)]
  })

  let searchTerm = $state('')
  let searchResults = $state<Datum[]>([])

  function handleSearch(e: Event) {
    const term = (e.target as HTMLInputElement).value
    searchTerm = term
    if (term.trim().length > 0) {
      // Filter out current item from results
      searchResults = data.searchEntries(term).filter(item => !excludeIds.includes(item._id))
    }
    else {
      searchResults = []
    }
  }

  function handleSelect(item: Datum) {
    onLink?.(item)
    onClose?.()
    searchTerm = ''
    searchResults = []
  }
</script>

<Modal
  {isOpen}
  title={i18n.t('dialogs.linkItems')}
  {onClose}
  boxClass='max-w-lg h-[600px] flex flex-col'
>
  {#snippet children()}
    <div class='flex flex-col h-full gap-4'>
      <div class='relative w-full'>
        <div class='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
          <Search class='h-4 w-4 text-base-content/50' />
        </div>
        <input
          type='text'
          class='input input-bordered w-full pl-10'
          placeholder={i18n.t('search.searchToLink')}
          value={searchTerm}
          oninput={handleSearch}
        />
      </div>

      <div class='flex-1 overflow-y-auto min-h-0 border rounded-box p-2 bg-base-100'>
        {#if searchResults.length === 0 && searchTerm}
          <div class='flex items-center justify-center h-full text-base-content/50'>
            {i18n.t('search.noResults')}
          </div>
        {:else if searchResults.length === 0}
          <div class='flex items-center justify-center h-full text-base-content/50'>
            {i18n.t('search.placeholder')}
          </div>
        {:else}
          <ul class='menu bg-base-100 w-full p-0'>
            {#each searchResults as item (item._id)}
              <li>
                <button onclick={() => handleSelect(item)} class='flex items-center gap-3 py-2'>
                  <BrandIcon name={item.title} size='2rem' />
                  <div class='flex flex-col items-start overflow-hidden'>
                    <span class='font-medium truncate w-full text-left'>{item.title}</span>
                    <span class='text-xs text-base-content/70 capitalize'>{getEntryTypeLabel(item._type, i18n)}</span>
                  </div>
                </button>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    </div>
  {/snippet}
</Modal>
