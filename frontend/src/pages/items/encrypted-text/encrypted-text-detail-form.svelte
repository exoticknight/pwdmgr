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

<div class='encrypted-text-detail-form'>
  <!-- Content Field -->
  <label class='label' for='content-input'>
    {i18n.t('forms.content')}
  </label>
  <div class='content-input-group'>
    <textarea
      id='content-input'
      class='textarea w-full'
      value={(formData as any).content || ''}
      oninput={e => onFieldChange('content', e.currentTarget.value)}
      placeholder={i18n.t('forms.contentPlaceholder')}
      rows='8'
    ></textarea>
    <div class='content-actions'>
      <button
        type='button'
        class='btn btn-sm'
        onclick={() => onCopyToClipboard(entry.content || '')}
        title={i18n.t('actions.copy')}
      >
        <Copy size={14} />
      </button>
    </div>
  </div>

  <!-- Notes Field -->
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

<style>
  .encrypted-text-detail-form {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  /* Encrypted text specific styles */
  .content-input-group {
    position: relative;
  }

  .content-actions {
    position: absolute;
    top: var(--space-xs);
    right: var(--space-xs);
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
    background: var(--color-bg);
    border-radius: var(--radius-sm);
    padding: var(--space-xs);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .content-actions .btn {
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border);
  }

  .content-actions .btn:hover {
    background: var(--color-bg-hover);
  }
</style>
