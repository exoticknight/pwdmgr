<script lang='ts'>
  import type { Datum } from '@/types/data'
  import { ChevronRight, Link, Trash2 } from '@lucide/svelte'

  import BrandIcon from '@/components/brand-icon.svelte'
  import { data } from '@/stores/data.svelte'
  import { i18n } from '@/stores/i18n.svelte'
  import { getEntryTypeLabel } from '@/utils/entry-types'

  import ClusterLinkModal from './cluster-link-modal.svelte'
  import DetailCard from './detail-card.svelte'

  interface Props {
    entry: Datum
    onSelect?: (entry: Datum) => void
    onLinkItems?: (sourceId: string, targetId: string) => void
    onUnlinkItem?: (id: string) => void
  }

  const { entry, onSelect, onLinkItems, onUnlinkItem }: Props = $props()

  let isModalOpen = $state(false)

  // Use derived to reactively get items when entry or cluster changes
  const clusterItems = $derived.by(() => {
    // Look up the latest entry state from the store to ensure reactivity
    // when data.linkItems updates the store.
    const currentEntry = data.entries.find(e => e._id === entry._id) || entry

    if (!currentEntry._clusterId)
      return []
    return data.getClusterItems(currentEntry._clusterId).filter(e => e._id !== currentEntry._id)
  })

  function handleUnlink(item: Datum) {
    onUnlinkItem?.(item._id)
  }

  function handleLink(target: Datum) {
    onLinkItems?.(entry._id, target._id)
  }

  function openModal() {
    isModalOpen = true
  }

  function closeModal() {
    isModalOpen = false
  }
</script>

<DetailCard title={i18n.t('forms.links')}>
  <div class='flex flex-col gap-4'>
    {#if clusterItems.length > 0}
      <ul class='list bg-base-100 rounded-box'>
        {#each clusterItems as item (item._id)}
          <li class='list-row items-center'>
            <div class='w-8 h-8 grid place-items-center rounded-box border border-base-300 bg-base-100'>
              <BrandIcon name={item.title} size='1.25rem' />
            </div>
            <div>
              <div class='truncate'>{item.title}</div>
              <div class='font-medium uppercase font-semibold opacity-60'>{getEntryTypeLabel(item._type, i18n)}</div>
            </div>
            <button
              class='btn btn-square btn-ghost'
              title={i18n.t('actions.open')}
              onclick={() => onSelect?.(item)}
            >
              <ChevronRight size={16} />
            </button>
            <button
              class='btn btn-square btn-ghost'
              title={i18n.t('actions.unlink')}
              onclick={() => handleUnlink(item)}
            >
              <Trash2 size={16} />
            </button>
          </li>
        {/each}
      </ul>
    {:else}
      <div class='text-sm text-base-content/50'>
        {i18n.t('forms.noLinks')}
      </div>
    {/if}

    <div class='flex justify-end'>
      <button class='btn btn-outline gap-2' title={i18n.t('actions.add')} onclick={openModal}>
        <Link size={14} />
        {i18n.t('actions.add')}
      </button>
    </div>
  </div>
</DetailCard>

<ClusterLinkModal
  isOpen={isModalOpen}
  currentId={entry._id}
  onClose={closeModal}
  onLink={handleLink}
/>
