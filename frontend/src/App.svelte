<script lang='ts'>
  import type { RouteConfig, RouteResult, RouterInstanceConfig } from '@mateothegreat/svelte5-router'
  import { Router } from '@mateothegreat/svelte5-router'
  import { onMount } from 'svelte'
  import Landing from './pages/landing.svelte'
  import Table from './pages/table.svelte'
  import { navigationService } from './utils/navigation'

  const routes: RouteConfig[] = [
    {
      component: Landing,
    },
    {
      path: 'table',
      component: Table,
    },
  ]

  const hooks: RouterInstanceConfig['hooks'] = {
    pre: (_route: RouteResult) => {
      return navigationService.canNavigate()
    },
  }

  onMount(() => {
    // Simple browser navigation blocking
    const handlePopstate = (event: PopStateEvent) => {
      event.preventDefault()
    }

    window.addEventListener('popstate', handlePopstate, true)

    return () => {
      window.removeEventListener('popstate', handlePopstate, true)
    }
  })
</script>

<Router {routes} {hooks} />

<style>
</style>
