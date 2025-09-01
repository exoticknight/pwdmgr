<script lang='ts'>
  import type { EncryptedTextData } from '@/types/data'

  import { Copy } from '@lucide/svelte'

  import { i18n } from '@/stores/i18n.svelte'

  interface Props {
    entry: EncryptedTextData
    formData: Partial<EncryptedTextData>
    onFieldChange: (field: string, value: string) => void
    onCopyToClipboard: (text: string) => void
  }

  const {
    entry,
    formData,
    onFieldChange,
    onCopyToClipboard,
  }: Props = $props()
</script>

<div class='flex flex-col space-y-6'>
  <div class='card bg-base-200 shadow-sm'>
    <div class='card-body p-4'>
      <h3 class='card-title text-lg mb-4'>{i18n.t('forms.encryptedContent')}</h3>

      <label class='label' for='content-input'>
        {i18n.t('forms.content')}
      </label>
      <div class='join w-full'>
        <textarea
          id='content-input'
          class='textarea join-item flex-1'
          value={(formData as any).content || ''}
          oninput={e => onFieldChange('content', e.currentTarget.value)}
          placeholder={i18n.t('forms.contentPlaceholder')}
          rows='8'
        ></textarea>
        <div class='flex flex-col'>
          <button
            type='button'
            class='btn join-item'
            onclick={() => onCopyToClipboard(entry.content || '')}
            title={i18n.t('actions.copy')}
          >
            <Copy size={16} />
          </button>
        </div>
      </div>
    </div>
  </div>

  <div class='card bg-base-200 shadow-sm'>
    <div class='card-body p-4'>
      <h3 class='card-title text-lg mb-4'>{i18n.t('forms.additionalInformation')}</h3>

      <label class='label' for='notes-input'>
        {i18n.t('forms.notes')}
      </label>
      <textarea
        id='notes-input'
        class='textarea w-full'
        value={formData.notes || ''}
        oninput={e => onFieldChange('notes', e.currentTarget.value)}
        placeholder={i18n.t('forms.notesPlaceholder')}
        rows='4'
      ></textarea>
    </div>
  </div>

</div>
