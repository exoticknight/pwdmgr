<script lang='ts'>
  import { route, Routes } from '@/stores/route.svelte'
</script>

<nav class='w-full h-full flex flex-col justify-between'>
  <div class='flex flex-col'>
    <button class='btn btn-ghost' class:btn-active={route.route === Routes.ITEMS_ALL} onclick={() => route.navigate(Routes.ITEMS_ALL)}>All Items</button>
    <button class='btn btn-ghost' class:btn-active={route.route === Routes.ITEMS_FAVORITES} onclick={() => route.navigate(Routes.ITEMS_FAVORITES)}>Favorites</button>
    <button class='btn btn-ghost' class:btn-active={route.route === Routes.ITEMS_RECENT} onclick={() => route.navigate(Routes.ITEMS_RECENT)}>Recently Used</button>
  </div>
  <div class='flex flex-col'>
    <button class='btn btn-ghost'>Close</button>
  </div>
</nav>

<style></style>
