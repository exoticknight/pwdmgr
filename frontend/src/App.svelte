<script lang='ts'>
  import type { RouteConfig, RouteResult, RouterInstanceConfig } from '@mateothegreat/svelte5-router'
  import { Router } from '@mateothegreat/svelte5-router'
  import AutoLock from '@/components/auto-lock.svelte'
  import GlobalDialog from '@/components/dialog.svelte'
  import Notification from '@/components/notification.svelte'
  import Landing from '@/pages/landing.svelte'
  import Main from '@/pages/main.svelte'
  import { autoLock } from '@/stores/auto-lock.svelte'
  import { route } from '@/stores/route.svelte'

  const routes: RouteConfig[] = [
    {
      component: Landing,
    },
    {
      path: '/home/*',
      component: Main,
    },
  ]

  const hooks: RouterInstanceConfig['hooks'] = {
    pre: (_route: RouteResult) => {
      return route.canNavigate()
    },
  }

  function handleActivity() {
    autoLock.resetTimer()
  }

  ;['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'].forEach((event) => {
    document.addEventListener(event, handleActivity, { passive: true })
  })
</script>

<Router {routes} {hooks} />

<!-- Auto Lock Component -->
<AutoLock />

<!-- Global Notifications -->
<Notification />

<!-- Global Dialog -->
<GlobalDialog />

<style>
</style>
