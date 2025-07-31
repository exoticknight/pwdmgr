<script lang='ts'>
  import type { DialogControl } from '@/types/dialog'
  import { appStore } from '@/stores/app.svelte'
  import { dialog } from '@/stores/dialog.svelte'
  import i18n from '@/stores/i18n.svelte'
  import { route, Routes } from '@/stores/route.svelte'

  // Here we can use type constraints to ensure only DialogControl interface is used
  // This way if we change UI framework in the future, this part of code doesn't need modification
  const dialogControl: DialogControl = dialog

  // Handle close/back functionality
  async function handleClose() {
    // Check if there are unsaved changes in the application
    const hasUnsavedChanges = appStore.hasUnsavedChanges

    if (hasUnsavedChanges) {
      const confirmed = await dialogControl.confirm(i18n.t('errors.unsavedChanges'))
      if (!confirmed) {
        return
      }
    }

    // Reset app state when navigating away
    appStore.reset()
    route.navigate(Routes.LANDING)
  }
</script>

<nav class='w-full h-full flex flex-col justify-between navigation'>
  <div class='flex flex-col'>
    <button class='btn btn-ghost' class:btn-active={route.route === Routes.ITEMS_ALL} onclick={() => route.navigate(Routes.ITEMS_ALL)}>{i18n.t('navigation.allItems')}</button>
    <button class='btn btn-ghost' class:btn-active={route.route === Routes.ITEMS_FAVORITES} onclick={() => route.navigate(Routes.ITEMS_FAVORITES)}>{i18n.t('navigation.favorites')}</button>
    <button class='btn btn-ghost' class:btn-active={route.route === Routes.ITEMS_RECENT} onclick={() => route.navigate(Routes.ITEMS_RECENT)}>{i18n.t('navigation.recentlyUsed')}</button>
  </div>
  <div class='flex flex-col'>
    <button class='btn btn-ghost' class:btn-active={route.route === Routes.SETTING} onclick={() => route.navigate(Routes.SETTING)}>{i18n.t('navigation.settings')}</button>
    <button class='btn btn-ghost' onclick={handleClose}>{i18n.t('navigation.close')}</button>
  </div>
</nav>

<style scoped>
  .navigation {
    padding: var(--space-sm);
  }
</style>
