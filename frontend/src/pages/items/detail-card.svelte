<script lang='ts'>
  interface Props {
    title: string
    children?: any
  }

  const { title, children }: Props = $props()
</script>

<div class='card bg-base-200 shadow-sm'>
  <div class='card-body p-4'>
    <h3 class='card-title text-lg'>{title}</h3>
    {@render children?.()}
  </div>
</div>
