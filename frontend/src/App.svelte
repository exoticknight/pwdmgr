<script lang='ts'>
  import type { RouteConfig, RouteResult, RouterInstanceConfig } from '@mateothegreat/svelte5-router'
  import { Router } from '@mateothegreat/svelte5-router'
  import { onMount } from 'svelte'
  import GlobalNotifications from './components/global-notifications.svelte'
  import Home from './pages/home.svelte'
  import Landing from './pages/landing.svelte'
  import { navigationService } from './utils/navigation'

  const routes: RouteConfig[] = [
    {
      component: Landing,
    },
    {
      path: 'home',
      component: Home,
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

<!-- Global Notifications -->
<GlobalNotifications />

<style>
</style>
