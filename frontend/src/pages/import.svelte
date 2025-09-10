<script lang='ts'>
  import type { ImportEntry } from './import/importers/types'
  import { FileDown } from '@lucide/svelte'
  import { data } from '@/stores/data.svelte'
  import { i18n } from '@/stores/i18n.svelte'
  import { notification } from '@/stores/notification.svelte'
  import Csv from './import/csv.svelte'
  import Vendor from './import/vendor.svelte'

  function handleData(importedData: ImportEntry[], errorCount: number) {
    data.addEntries(importedData)
    notification.success(i18n.t('import.success', { count: importedData.length, error: errorCount }))
  }
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
      <input type='radio' name='import-accordion' checked />
      <div class='collapse-title text-xl font-medium'>
        {i18n.t('import.types.vendor.title')}
      </div>
      <div class='collapse-content'>
        <Vendor onData={handleData} />
      </div>
    </div>

    <div class='collapse collapse-arrow border border-base-300'>
      <input type='radio' name='import-accordion' />
      <div class='collapse-title text-xl font-medium'>
        {i18n.t('import.types.csv.title')}
      </div>
      <div class='collapse-content'>
        <Csv onData={handleData} />
      </div>
    </div>
  </div>
</div>
