<script lang='ts'>
  import type { DialogControl } from '@/types/dialog'
  import {
    BrickWallShield,
    CircleX,
    Clock,
    FileText,
    RectangleEllipsis,
    Settings,
    ShieldUser,
    Star,
    WalletCards,
  } from '@lucide/svelte'
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
    <li>
      <button class='btn btn-ghost justify-start gap-3' class:btn-active={route.route === Routes.ITEMS_ALL} onclick={() => route.navigate(Routes.ITEMS_ALL)}>
        <WalletCards size={16} />
        {i18n.t('navigation.allItems')}
      </button>
    </li>
    <li>
      <button class='btn btn-ghost justify-start gap-3' class:btn-active={route.route === Routes.ITEMS_FAVORITES} onclick={() => route.navigate(Routes.ITEMS_FAVORITES)}>
        <Star size={16} />
        {i18n.t('navigation.favorites')}
      </button>
    </li>
    <li>
      <button class='btn btn-ghost justify-start gap-3' class:btn-active={route.route === Routes.ITEMS_RECENT} onclick={() => route.navigate(Routes.ITEMS_RECENT)}>
        <Clock size={16} />
        {i18n.t('navigation.recentlyUsed')}
      </button>
    </li>
    <li>
      <button class='btn btn-ghost justify-start gap-3' class:btn-active={route.route === Routes.ITEMS_PASSWORD} onclick={() => route.navigate(Routes.ITEMS_PASSWORD)}>
        <RectangleEllipsis size={16} />
        {i18n.t('navigation.password')}
      </button>
    </li>
    <li>
      <button class='btn btn-ghost justify-start gap-3' class:btn-active={route.route === Routes.ITEMS_TEXT} onclick={() => route.navigate(Routes.ITEMS_TEXT)}>
        <FileText size={16} />
        {i18n.t('navigation.text')}
      </button>
    </li>
    <li>
      <button class='btn btn-ghost justify-start gap-3' class:btn-active={route.route === Routes.ITEMS_2FA} onclick={() => route.navigate(Routes.ITEMS_2FA)}>
        <ShieldUser size={16} />
        {i18n.t('navigation.twoFactorAuth')}
      </button>
    </li>
  </ul>
  <ul class='menu w-full'>
    <li>
      <button class='btn btn-ghost justify-start gap-3' class:btn-active={route.route === Routes.AUDIT} onclick={() => route.navigate(Routes.AUDIT)}>
        <BrickWallShield size={16} />
        {i18n.t('navigation.audit')}
      </button>
    </li>
    <li>
      <button class='btn btn-ghost justify-start gap-3' class:btn-active={route.route === Routes.SETTING} onclick={() => route.navigate(Routes.SETTING)}>
        <Settings size={16} />
        {i18n.t('navigation.settings')}
      </button>
    </li>
  </ul>
  <div class='flex-grow-1'></div>
  <ul class='menu w-full'>
    <li>
      <button class='btn btn-ghost justify-start gap-3' onclick={handleClose}>
        <CircleX size={16} />
      </button>
    </li>
  </ul>
</nav>

<style scope>
  .navigation {
    background-color: var(--color-bg-secondary);
  }
</style>
