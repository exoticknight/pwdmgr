<script lang='ts'>
  import { app } from '@/stores/app.svelte'

  interface Props {
    title: string
    items?: any
  }

  const { title, items }: Props = $props()

  function markUnsaved() {
    app.markSettingAsUnsaved()
  }
</script>

<div class='setting-section'>
  <h1 class='text-xl font-semibold text-base-content'>{title}</h1>
  <div class='divider'></div>

  <div class='setting-content'>
    {@render items?.(markUnsaved)}
  </div>
</div>

<style scoped>
  .setting-section {
    display: flex;
    flex-direction: column;
  }

  .setting-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>
