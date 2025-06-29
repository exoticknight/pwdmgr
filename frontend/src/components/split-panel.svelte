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
  class='flex h-full w-full overflow-hidden'
>
  <!-- Left panel -->
  <div
    class='flex-none overflow-hidden'
    style='width: {leftWidth}%'
  >
    {@render left()}
  </div>

  <!-- Resizer -->
  <button
    class='flex-none w-1 bg-base-300 hover:bg-primary cursor-col-resize transition-colors user-select-none border-none p-0 {isDragging ? 'bg-primary' : ''}'
    aria-label='Resize panels'
    type='button'
    onmousedown={handleMouseDown}
  ></button>

  <!-- Right panel -->
  <div
    class='flex-1 h-full'
    style='width: {100 - leftWidth}%'
  >
    {@render right()}
  </div>
</div>

<style>
  .user-select-none {
    user-select: none;
  }
</style>
