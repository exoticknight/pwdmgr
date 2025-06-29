<script lang='ts'>
  import type { Snippet } from 'svelte'
  import { onMount } from 'svelte'

  interface Props {
    initialLeftWidth?: number // percentage
    minLeftWidth?: number // percentage
    maxLeftWidth?: number // percentage
    onResize?: (leftWidth: number) => void
    left: Snippet
    right: Snippet
  }

  const {
    initialLeftWidth = 40,
    minLeftWidth = 20,
    maxLeftWidth = 80,
    onResize,
    left,
    right,
  }: Props = $props()

  let container: HTMLDivElement
  let isDragging = $state(false)
  let leftWidth = $state(initialLeftWidth)

  onMount(() => {
    leftWidth = initialLeftWidth
  })

  function handleMouseDown(e: MouseEvent) {
    e.preventDefault()
    isDragging = true

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'col-resize'
  }

  function handleMouseMove(e: MouseEvent) {
    if (!isDragging || !container) {
      return
    }

    const containerRect = container.getBoundingClientRect()
    const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100

    // Constrain between min and max
    leftWidth = Math.max(minLeftWidth, Math.min(maxLeftWidth, newLeftWidth))
    onResize?.(leftWidth)
  }

  function handleMouseUp() {
    isDragging = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    document.body.style.userSelect = ''
    document.body.style.cursor = ''
  }
</script>

<!-- Container wrapper -->
<div
  bind:this={container}
  class='split-container'
>
  <!-- Left panel -->
  <div
    class='split-panel-left'
    style='width: {leftWidth}%'
  >
    {@render left()}
  </div>

  <!-- Resizer -->
  <button
    class='split-resizer {isDragging ? 'split-resizer-active' : ''}'
    aria-label='Resize panels'
    type='button'
    onmousedown={handleMouseDown}
  ></button>

  <!-- Right panel -->
  <div
    class='split-panel-right'
    style='width: {100 - leftWidth}%'
  >
    {@render right()}
  </div>
</div>

<style>
  .split-container {
    display: flex;
    height: 100%;
    width: 100%;
    overflow: hidden;
  }

  .split-panel-left {
    flex: none;
    height: 100%;
    overflow: hidden;
  }

  .split-panel-right {
    flex: 1;
    height: 100%;
    overflow: hidden;
  }

  .split-resizer {
    flex: none;
    width: 1px;
    background-color: var(--color-border);
    cursor: col-resize;
    border: none;
    padding: 0;
    transition: background-color 0.2s ease;
    user-select: none;
    position: relative;
  }

  .split-resizer:hover,
  .split-resizer-active {
    background-color: var(--color-primary);
  }

  .split-resizer::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 8px;
    height: 20px;
    background: repeating-linear-gradient(
      90deg,
      transparent,
      transparent 1px,
      var(--color-text-muted) 1px,
      var(--color-text-muted) 2px
    );
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .split-resizer:hover::before {
    opacity: 0.5;
  }
</style>
