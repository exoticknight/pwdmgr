<script lang='ts'>
  import type { DialogControl } from '@/types/dialog'
  import { app } from '@/stores/app.svelte'
  import { database } from '@/stores/database.svelte'
  import { dialog } from '@/stores/dialog.svelte'
  import { i18n } from '@/stores/i18n.svelte'
  import { route, Routes } from '@/stores/route.svelte'

  const dialogControl: DialogControl = dialog

  async function handleClose() {
    if (app.hasDataUnsavedChanges || app.hasSettingUnsavedChanges) {
      const confirmed = await dialogControl.confirm(i18n.t('errors.unsavedChanges'))
      if (!confirmed) {
        return
      }
    }

    app.reset()
    database.close()
    route.navigate(Routes.LANDING)
  }
</script>

<nav class='navigation w-full h-full flex flex-col'>
  <ul class='menu w-full'>
    <li><button class='btn btn-ghost justify-start' class:btn-active={route.route === Routes.ITEMS_ALL} onclick={() => route.navigate(Routes.ITEMS_ALL)}>{i18n.t('navigation.allItems')}</button></li>
    <li><button class='btn btn-ghost justify-start' class:btn-active={route.route === Routes.ITEMS_FAVORITES} onclick={() => route.navigate(Routes.ITEMS_FAVORITES)}>{i18n.t('navigation.favorites')}</button></li>
    <li><button class='btn btn-ghost justify-start' class:btn-active={route.route === Routes.ITEMS_RECENT} onclick={() => route.navigate(Routes.ITEMS_RECENT)}>{i18n.t('navigation.recentlyUsed')}</button></li>
    <li><button class='btn btn-ghost justify-start' class:btn-active={route.route === Routes.ITEMS_PASSWORD} onclick={() => route.navigate(Routes.ITEMS_PASSWORD)}>{i18n.t('navigation.password')}</button></li>
    <li><button class='btn btn-ghost justify-start' class:btn-active={route.route === Routes.ITEMS_TEXT} onclick={() => route.navigate(Routes.ITEMS_TEXT)}>{i18n.t('navigation.text')}</button></li>
    <li><button class='btn btn-ghost justify-start' class:btn-active={route.route === Routes.ITEMS_2FA} onclick={() => route.navigate(Routes.ITEMS_2FA)}>{i18n.t('navigation.twoFactorAuth')}</button></li>
  </ul>
  <ul class='menu w-full'>
    <li><button class='btn btn-ghost justify-start' class:btn-active={route.route === Routes.AUDIT} onclick={() => route.navigate(Routes.AUDIT)}>{i18n.t('navigation.audit')}</button></li>
  </ul>
  <div class='flex-grow-1'></div>
  <ul class='menu w-full'>
    <li><button class='btn btn-ghost justify-start' class:btn-active={route.route === Routes.SETTING} onclick={() => route.navigate(Routes.SETTING)}>{i18n.t('navigation.settings')}</button></li>
    <li><button class='btn btn-ghost justify-start' onclick={handleClose}>{i18n.t('navigation.close')}</button></li>
  </ul>
</nav>

<style scope>
  .navigation {
    gap: var(--space-sm);
  }
</style>
