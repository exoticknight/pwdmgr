<script lang='ts'>
  import { Lock } from '@lucide/svelte'
  import i18next from '../i18n'

  interface Props {
    isSearching: boolean
  }

  const { isSearching }: Props = $props()
</script>

<div class='text-center py-16'>
  <Lock class='w-16 h-16 mx-auto mb-4 text-base-content/30' />
  <p class='text-lg mb-2'>
    {isSearching ? i18next.t('search.noResults') : i18next.t('table.empty')}
  </p>
  {#if !isSearching}
    <p class='text-base-content/60'>{i18next.t('table.helpText')}</p>
  {/if}
</div>
