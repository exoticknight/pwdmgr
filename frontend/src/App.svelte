<script lang='ts'>
  import type { RouteConfig, RouteResult, RouterInstanceConfig } from '@mateothegreat/svelte5-router'
  import { goto, Router } from '@mateothegreat/svelte5-router'
  import Landing from './pages/landing.svelte'
  import Table from './pages/table.svelte'
  import { userState } from './store/user.svelte'

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
    pre: (route: RouteResult) => {
      if (route.result.path.original === '/') {
        return true
      }

      if (userState.dbPath === '') {
        console.warn('No database path set, redirecting to landing page')
        goto('/')
        return false
      }

      return true
    },
  }
</script>

<Router {routes} {hooks} />

<style>
</style>
