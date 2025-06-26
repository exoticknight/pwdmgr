<script lang>
  import { goto } from '@mateothegreat/svelte5-router'
  import { onMount } from 'svelte'

  onMount(() => {
    console.log('Home component mounted')
  })
</script>

<div>
  Home
  <button class='btn' type='button' on:click={() => goto('/#table')}>Go to Table</button>
</div>
