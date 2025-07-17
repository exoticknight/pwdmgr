<script lang='ts'>
  import i18next from '@/i18n'
  import { appStore } from '@/stores/app.svelte'
  import { route, Routes } from '@/stores/route.svelte'

  // Handle close/back functionality
  function handleClose() {
    // Check if there are unsaved changes in the application
    const hasUnsavedChanges = appStore.hasUnsavedChanges
    
    if (hasUnsavedChanges) {
      // eslint-disable-next-line no-alert
      const confirmed = window.confirm(i18next.t('errors.unsavedChanges'))
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
    <button class='btn btn-ghost' class:btn-active={route.route === Routes.ITEMS_ALL} onclick={() => route.navigate(Routes.ITEMS_ALL)}>All Items</button>
    <button class='btn btn-ghost' class:btn-active={route.route === Routes.ITEMS_FAVORITES} onclick={() => route.navigate(Routes.ITEMS_FAVORITES)}>Favorites</button>
    <button class='btn btn-ghost' class:btn-active={route.route === Routes.ITEMS_RECENT} onclick={() => route.navigate(Routes.ITEMS_RECENT)}>Recently Used</button>
  </div>
  <div class='flex flex-col'>
    <button class='btn btn-ghost' onclick={handleClose}>Close</button>
  </div>
</nav>

<style scoped>
  .navigation {
    padding: var(--space-sm);
  }
</style>
