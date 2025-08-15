<script lang='ts'>
  interface Props {
    remainingTime: number
    totalTime: number
    class?: string
  }

  const {
    remainingTime,
    totalTime,
    class: customClass = '',
  }: Props = $props()

  const progress = $derived(Math.max(0, Math.min(1, remainingTime / totalTime)))

  function getProgressStyle(progress: number): string {
    const percentage = Math.round(progress * 100)
    const hue = Math.round(progress * 120)
    return `--value:${percentage}; --hue: ${hue}`
  }
</script>

<div
  class='radial-progress radial {customClass}'
  style={getProgressStyle(progress)}
  aria-valuenow={Math.round(progress * 100)}
  role='progressbar'
>
  <span class='countdown font-mono text-base'>
    <span style='--value:{remainingTime};' aria-live='polite' aria-label={String(remainingTime)}>{remainingTime}</span>
  </span>
</div>

<style>
  .radial {
    --size: 3rem;
    --thickness: 2px;
    color: hsl(var(--hue, 120), 70%, 50%);
  }
</style>
