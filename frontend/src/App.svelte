<script lang="ts">
  import { Router, type RouteConfig } from "@mateothegreat/svelte5-router";
  import Home from "./pages/home.svelte";

  const routes: RouteConfig[] = [
    {
      component: Home,
    },
  ];
</script>

<Router {routes} />

<style>
</style>
