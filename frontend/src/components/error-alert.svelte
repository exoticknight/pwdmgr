<script lang='ts'>
  interface Props {
    error: string
  }

  const { error }: Props = $props()
</script>

{#if error}
  <div class='alert alert-error mt-4'>
    <svg class='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
      <path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'></path>
    </svg>
    <span>{error}</span>
  </div>
{/if}
