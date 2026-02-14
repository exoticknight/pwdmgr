<script lang='ts'>
  import { generate } from 'lean-qr'

  interface Props {
    value: string
    size?: number
  }

  const { value, size = 200 }: Props = $props()

  let canvas = $state<HTMLCanvasElement>()

  $effect(() => {
    if (canvas && value) {
      const code = generate(value)
      code.toCanvas(canvas)
    }
  })
</script>

<canvas
  bind:this={canvas}
  width={size}
  height={size}
  class='qr-canvas'
  style:width='{size}px'
  style:height='{size}px'
></canvas>

<style>
  .qr-canvas {
    image-rendering: pixelated;
  }
</style>
