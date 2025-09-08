<script lang='ts'>
  import { FileDown } from '@lucide/svelte'
  import { i18n } from '@/stores/i18n.svelte'
  import Csv from './import/csv.svelte'
  import Json from './import/json.svelte'
</script>

<div class='p-6 gap-6'>
  <div>
    <h1 class='text-3xl font-bold mb-2 flex items-center gap-3'>
      <FileDown size={32} />
      {i18n.t('nav.import')}
    </h1>
    <p class='text-base-content/70'>
      {i18n.t('import.description')}
    </p>
  </div>

  <div class='space-y-4'>
    <div class='collapse collapse-arrow border border-base-300'>
      <input type='radio' name='import-accordion' />
      <div class='collapse-title text-xl font-medium'>
        {i18n.t('import.formats.json.title')}
      </div>
      <div class='collapse-content'>
        <Json />
      </div>
    </div>

    <div class='collapse collapse-arrow border border-base-300'>
      <input type='radio' name='import-accordion' checked />
      <div class='collapse-title text-xl font-medium'>
        {i18n.t('import.formats.csv.title')}
      </div>
      <div class='collapse-content'>
        <Csv />
      </div>
    </div>
  </div>
</div>
