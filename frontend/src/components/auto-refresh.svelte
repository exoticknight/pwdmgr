<script lang='ts'>
  import type { Snippet } from 'svelte'
  import { onDestroy, onMount } from 'svelte'

  interface Props<T> {
    interval: number
    initial: T
    refresh: (prev: T) => T
    children: Snippet<[result: T]>
  }

  const { interval, children, refresh, initial }: Props<any> = $props()

  let result = $state(refresh(initial))
  let intervalID: ReturnType<typeof setInterval>

  onMount(() => {
    startAutoRefresh()
    return () => clearInterval(intervalID)
  })

  onDestroy(() => {
    clearInterval(intervalID)
  })

  function startAutoRefresh() {
    intervalID = setInterval(() => {
      result = refresh(result)
    }, interval)
  }
</script>

{#if children}
  {@render children(result)}
{/if}
