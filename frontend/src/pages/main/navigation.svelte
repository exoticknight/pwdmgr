<script lang='ts'>
  import type { DialogControl } from '@/types/dialog'
  import {
    BrickWallShield,
    CircleX,
    Download,
    Settings,
  } from '@lucide/svelte'
  import { onDestroy, onMount } from 'svelte'
  import { app } from '@/stores/app.svelte'
  import { autoLock } from '@/stores/auto-lock.svelte'
  import { database } from '@/stores/database.svelte'
  import { dialog } from '@/stores/dialog.svelte'
  import { i18n } from '@/stores/i18n.svelte'
  import { navigation } from '@/stores/navigation.svelte'
  import { route, Routes } from '@/stores/route.svelte'
  import { throttle } from '@/utils/throttle'

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

  autoLock.startTimer()

  const throttledHandleActivity = throttle(() => autoLock.startTimer(), 1000)

  onMount(() => {
    ;['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'].forEach((event) => {
      document.addEventListener(event, throttledHandleActivity, { passive: true })
    })
  })

  onDestroy(() => {
    ;['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'].forEach((event) => {
      document.removeEventListener(event, throttledHandleActivity)
    })
  })
</script>

<nav class='navigation w-full h-full flex flex-col'>
  <ul class='menu w-full'>
    {#each navigation.visibleItems as item (item.id)}
      <li>
        <button
          class='btn btn-ghost justify-start gap-3'
          class:btn-active={route.route === item.route}
          onclick={() => route.navigate(item.route)}
        >
          <item.icon size={16} />
          {i18n.t(item.labelKey)}
        </button>
      </li>
    {/each}
  </ul>
  <ul class='menu w-full'>
    <li>
      <button class='btn btn-ghost justify-start gap-3' class:btn-active={route.route === Routes.IMPORT} onclick={() => route.navigate(Routes.IMPORT)}>
        <Download size={16} />
        {i18n.t('navigation.import')}
      </button>
    </li>
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
