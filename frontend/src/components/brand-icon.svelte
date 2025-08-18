<script lang='ts'>
  import { KeyRound } from '@lucide/svelte'
  import { ServiceProvider } from '@/services/service-provider'

  interface Props {
    name: string
    size: string
    class?: string
  }

  const { name, class: className, size, ...props }: Props = $props()
  const c = $derived(`${name.length > 1 ? `fa-brands fa-${name.toLocaleLowerCase()}` : ''} ${className || ''}`)

  const fillColor = $derived(`color:${ServiceProvider.find(name)?.color || 'inherit'}`)

  const style = $derived([
    'line-height:1',
    `width:${size}`,
    `height:${size}`,
    `font-size:${size}`,
    fillColor,
  ].join(';'))
</script>

<div
  class='overflow-hidden font-mono'
  style={style}>
  {#if name.length === 0}
    <div
      class='grid place-items-center place-content-center'
      style={`width:${size};height:${size}`}
    >
      <KeyRound />
    </div>
  {/if}
  <div
    class='min-h-0 grid'>
    <i
      {...props}
      class={c}
      style={`max-width:${size};max-height:${size}`}
      aria-hidden='true'
    ></i>
  </div>
  <div
    class='grid place-items-center place-content-center scale-80'
    style='max-width:{size};max-height:{size}'>
    {name.slice(0, 1).toUpperCase()}
  </div>
</div>
