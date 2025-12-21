<script lang='ts'>
  import type { Datum } from '@/types/data'
  import { Link, Trash2 } from '@lucide/svelte'

  import BrandIcon from '@/components/brand-icon.svelte'
  import { data } from '@/stores/data.svelte'
  import { i18n } from '@/stores/i18n.svelte'

  import ClusterLinkModal from './cluster-link-modal.svelte'
  import DetailCard from './detail-card.svelte'

  interface Props {
    entry: Datum
    onSelect?: (entry: Datum) => void
  }

  const { entry, onSelect }: Props = $props()

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
    data.unlinkItem(item._id)
  }

  function handleLink(target: Datum) {
    data.linkItems(entry._id, target._id)
  }

  function openModal() {
    isModalOpen = true
  }

  function closeModal() {
    isModalOpen = false
  }
</script>

<DetailCard title={i18n.t('forms.links')}>
  <div class='flex flex-col gap-2'>
    {#if clusterItems.length > 0}
      <ul class='menu bg-base-100 w-full p-0 rounded-box'>
        {#each clusterItems as item (item._id)}
          <li class='flex flex-row items-center gap-2 py-1'>
            <!-- Navigation Button -->
            <button
              class='flex-1 flex items-center gap-3 text-left'
              onclick={() => onSelect?.(item)}
            >
              <BrandIcon name={item.title} size='1.5rem' />
              <div class='flex flex-col overflow-hidden'>
                <span class='font-medium truncate'>{item.title}</span>
                <span class='text-xs text-base-content/70 capitalize'>
                  {i18n.t(`entryTypes.${item._type}` as any) || item._type}
                </span>
              </div>
            </button>

            <!-- Unlink Button -->
            <button
              class='btn btn-ghost btn-sm btn-square'
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
      <button class='btn btn-outline gap-2' title={i18n.t('actions.link')} onclick={openModal}>
        <Link size={14} />
        {i18n.t('actions.link')}
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
