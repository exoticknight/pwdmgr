<script lang='ts'>
  interface Props {
    title: string
    description?: string
    control?: any
    disabled?: boolean
  }

  const { title, description, control, disabled = false }: Props = $props()
</script>

<div class='setting-item' class:disabled>
  <div class='setting-label'>
    <div class='setting-title text-base-content'>{title}</div>
    {#if description}
      <div class='setting-description text-base-content'>{description}</div>
    {/if}
  </div>
  {#if control}
    {@render control()}
  {/if}
</div>

<style scoped>
  .setting-item {
    display: flex;
    align-items: start;
    justify-content: space-between;
    transition: opacity 0.2s ease-in-out;
  }

  .setting-item.disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  .setting-label {
    flex: 1;
  }

  .setting-title {
    font-weight: 500;
  }

  .setting-description {
    font-size: 0.875rem;
    opacity: 0.7;
    margin-top: 0.25rem;
  }
</style>
