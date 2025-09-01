<script lang='ts'>
  import type { NavigationItemId } from '@/types/navigation'
  import { ArrowBigDown, ArrowBigUp, Eye, EyeOff, RotateCcw } from '@lucide/svelte'
  import { i18n } from '@/stores/i18n.svelte'
  import { navigation } from '@/stores/navigation.svelte'

  interface Props {
    markUnsaved: () => void
  }

  const { markUnsaved }: Props = $props()

  function handleMoveUp(itemId: NavigationItemId) {
    navigation.moveItemUp(itemId)
    markUnsaved()
  }

  function handleMoveDown(itemId: NavigationItemId) {
    navigation.moveItemDown(itemId)
    markUnsaved()
  }

  function handleToggleVisibility(itemId: NavigationItemId) {
    navigation.toggleItemVisibility(itemId)
    markUnsaved()
  }

  function handleReset() {
    navigation.resetToDefault()
    markUnsaved()
  }

  const allItems = $derived(navigation.allItems)
</script>

<div class='space-y-4'>
  <div class='space-y-1'>
    {#each allItems as item, index (item.id)}
      <div
        class={`group flex items-center gap-3 p-2 rounded-lg border transition-colors bg-base-100 hover:bg-base-200 ${
          item.visible
            ? 'border-base-300'
            : 'border-base-300/70'
        }`}
      >
        <label class='swap tooltip tooltip-left' data-tip={item.visible ? i18n.t('setting.interface.navigationHide') : i18n.t('setting.interface.navigationShow')}>
          <input
            type='checkbox'
            checked={item.visible}
            onchange={() => handleToggleVisibility(item.id)}
          />
          <EyeOff size={16} class='swap-off' />
          <Eye size={16} class='swap-on' />
        </label>

        <!-- Column 2: Title (auto-expanding) -->
        <div class='flex items-center gap-3 flex-1 min-w-46'>
          <item.icon
            size={16}
            class={`flex-shrink-0 transition-colors ${item.visible ? 'text-base-content/70' : 'text-base-content/50'}`}
          />
          <span
            class={`font-medium text-sm truncate transition-colors ${item.visible ? 'text-base-content' : 'text-base-content/50 line-through'}`}
          >{i18n.t(item.labelKey)}</span>
        </div>

        <!-- Column 3: Arrow controls (only visible on hover) -->
        <div class='flex items-center gap-0 opacity-0 group-hover:opacity-100 transition-opacity'>
          <!-- Move up arrow -->
          <button
            class='btn btn-ghost btn-sm p-1 min-h-0 h-8 w-8 tooltip tooltip-left'
            class:invisible={index === 0}
            onclick={() => handleMoveUp(item.id)}
            disabled={index === 0}
            data-tip={i18n.t('setting.interface.navigationMoveUp')}
          >
            <ArrowBigUp size={16} />
          </button>

          <!-- Move down arrow -->
          <button
            class='btn btn-ghost btn-sm p-1 min-h-0 h-8 w-8 tooltip tooltip-left'
            class:invisible={index === allItems.length - 1}
            onclick={() => handleMoveDown(item.id)}
            disabled={index === allItems.length - 1}
            data-tip={i18n.t('setting.interface.navigationMoveDown')}
          >
            <ArrowBigDown size={16} />
          </button>
        </div>
      </div>
    {/each}
  </div>

  <!-- Reset button -->
  <div class='flex justify-end'>
    <button
      class='btn btn-outline gap-2'
      onclick={handleReset}
    >
      <RotateCcw size={16} />
      {i18n.t('setting.interface.navigationResetButton')}
    </button>
  </div>
</div>
