<script lang='ts'>
  import { Router } from '@mateothegreat/svelte5-router'
  import i18next from '@/i18n'
  import { database } from '@/stores/database.svelte'
  import { Routes } from '@/stores/route.svelte'
  import Items from './items.svelte'
  import Navigation from './main/navigation.svelte'
  import Setting from './setting.svelte'

  // Create reactive routes
  const routes = [
    {
      path: Routes.ITEMS_ALL,
      component: Items,
      props: {
        filter: 'all',
      },
    },
    {
      path: Routes.ITEMS_FAVORITES,
      component: Items,
      props: {
        filter: 'favorites',
      },
    },
    {
      path: Routes.ITEMS_RECENT,
      component: Items,
      props: {
        filter: 'recent',
      },
    },
    {
      path: Routes.SETTING,
      component: Setting,
    },
  ]
</script>

{#if !database.initialized}
  <div class='loading-screen'>
    <div class='loading-content'>
      <span class='loading loading-spinner loading-xl'></span>
      <p class='loading-text'>{i18next.t('common.loading')}</p>
    </div>
  </div>
{:else}
  <div class='flex w-full h-full'>
    <div class='flex-none navigation'>
      <Navigation />
    </div>
    <div class='main-split-bar'></div>
    <div class='flex-1 h-full overflow-hidden'><Router {routes} /></div>
  </div>
{/if}

<style>
  .loading-screen {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--color-bg-primary);
  }

  .loading-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-md);
  }

  .loading-text {
    font-size: var(--font-size-base);
    color: var(--color-text-secondary);
    margin: 0;
  }

  .navigation{
    width: 20%;
  }

  .main-split-bar {
    width: 1px;
    background-color: var(--color-border);
    border: none;
    padding: 0;
    transition: background-color 0.2s ease;
    user-select: none;
  }
</style>
