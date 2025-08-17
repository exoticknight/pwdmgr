<script lang='ts'>
  interface Props {
    name: string
    size: string
    class?: string
  }

  const { name, class: className, size, ...props }: Props = $props()
  const c = `fa-brands fa-${name} ${className}`
</script>

<div class='overflow-hidden text-[{size}]  w-[{size}] h-[{size}]' style='line-height:1'>
  <div class='min-h-0 grid'>
    <i
      {...props}
      class={c}
      style={`max-width:${size};max-height:${size}`}
      aria-hidden='true'
    ></i>
  </div>
  <div class='grid place-items-center place-content-center max-h-[{size}] max-w-[{size}]'>
    {name.slice(0, 1).toUpperCase()}
  </div>
</div>
