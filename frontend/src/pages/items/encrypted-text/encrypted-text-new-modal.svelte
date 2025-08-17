<script lang='ts'>
  import type { EncryptedTextData, OmitBasicDataExcept } from '@/types/data'
  import BrandIcon from '@/components/brand-icon.svelte'
  import Modal from '@/components/modal.svelte'
  import { i18n } from '@/stores/i18n.svelte'

  interface Props {
    isOpen?: boolean
    onSave: (entry: OmitBasicDataExcept<EncryptedTextData, 'TYPE'>) => void
    onCancel: () => void
  }

  const { isOpen = false, onSave, onCancel }: Props = $props()

  // Form state
  const form = $state({
    title: '',
    content: '',
    notes: '',
  })

  // Form validation
  const isValid = $derived(
    !!(form.title.trim() && form.content.trim()),
  )

  function handleSubmit() {
    if (!isValid) {
      return
    }

    onSave({
      _type: 'encrypted_text',
      title: form.title.trim(),
      content: form.content.trim(),
      notes: form.notes.trim(),
    })
  }

  function handleFormSubmit(e: Event) {
    e.preventDefault()
    handleSubmit()
  }

  function handleCancel() {
    onCancel()
  }
</script>

<Modal
  {isOpen}
  title={i18n.t('forms.addEntry')}
  onClose={handleCancel}
  boxClass='max-w-fit'
>
  {#snippet children()}
    <div class='flex new-entry-panel'>
      <div class='flex-1 new-entry-panel-left'>
        <form onsubmit={handleFormSubmit}>
          <fieldset class='fieldset w-full'>
            <label class='label' for='icon'>
              {i18n.t('forms.icon')}
            </label>
            <div class='flex w-full justify-center h-[3rem]'>
              <BrandIcon name={form.title} size='3rem' />
            </div>

            <!-- Title -->
            <label class='label' for='title'>
              {i18n.t('forms.title')} *
            </label>
            <input
              id='title'
              type='text'
              bind:value={form.title}
              placeholder={i18n.t('forms.titlePlaceholder')}
              class='input w-full font-mono'
              required
            />

            <!-- Content -->
            <label class='label' for='content'>
              {i18n.t('forms.content')} *
            </label>
            <textarea
              id='content'
              bind:value={form.content}
              placeholder={i18n.t('forms.contentPlaceholder')}
              class='textarea textarea-bordered w-full font-mono'
              rows='8'
              required
            ></textarea>

            <!-- Notes -->
            <label class='label' for='notes'>
              {i18n.t('forms.notes')}
            </label>
            <textarea
              id='notes'
              bind:value={form.notes}
              placeholder={i18n.t('forms.notesPlaceholder')}
              class='textarea textarea-bordered w-full font-mono'
              rows='3'
            ></textarea>
          </fieldset>
        </form>
      </div>
    </div>
  {/snippet}

  {#snippet actions()}
    <button
      type='submit'
      class='btn btn-primary'
      disabled={!isValid}
      onclick={handleSubmit}
    >
      {i18n.t('actions.add')}
    </button>
  {/snippet}
</Modal>

<style>
  .new-entry-panel {
    --panel-width: 25rem;
    display: flex;
    gap: 1rem;
  }

  .new-entry-panel-left {
    width: var(--panel-width);
  }
</style>
