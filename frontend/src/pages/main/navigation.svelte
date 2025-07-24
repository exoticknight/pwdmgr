<script lang='ts'>
  import type { DialogControl } from '@/types/dialog'
  import i18next from '@/i18n'
  import { appStore } from '@/stores/app.svelte'
  import { dialog } from '@/stores/dialog.svelte'
  import { route, Routes } from '@/stores/route.svelte'

  // 这里我们可以类型约束，确保只使用 DialogControl 接口
  // 这样如果将来换UI框架，这部分代码完全不需要修改
  const dialogControl: DialogControl = dialog

  // Handle close/back functionality
  async function handleClose() {
    // Check if there are unsaved changes in the application
    const hasUnsavedChanges = appStore.hasUnsavedChanges

    if (hasUnsavedChanges) {
      const confirmed = await dialogControl.confirm(i18next.t('errors.unsavedChanges'))
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
    <button class='btn btn-ghost' class:btn-active={route.route === Routes.ITEMS_ALL} onclick={() => route.navigate(Routes.ITEMS_ALL)}>{i18next.t('navigation.allItems')}</button>
    <button class='btn btn-ghost' class:btn-active={route.route === Routes.ITEMS_FAVORITES} onclick={() => route.navigate(Routes.ITEMS_FAVORITES)}>{i18next.t('navigation.favorites')}</button>
    <button class='btn btn-ghost' class:btn-active={route.route === Routes.ITEMS_RECENT} onclick={() => route.navigate(Routes.ITEMS_RECENT)}>{i18next.t('navigation.recentlyUsed')}</button>
  </div>
  <div class='flex flex-col'>
    <button class='btn btn-ghost' onclick={handleClose}>{i18next.t('navigation.close')}</button>
  </div>
</nav>

<style scoped>
  .navigation {
    padding: var(--space-sm);
  }
</style>
