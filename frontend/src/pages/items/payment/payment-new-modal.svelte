<script lang='ts'>
  import type { OmitBasicDataExcept, PaymentInfoData } from '@/types/data'
  import BrandIcon from '@/components/brand-icon.svelte'
  import Modal from '@/components/modal.svelte'
  import { i18n } from '@/stores/i18n.svelte'
  import { DataMetaType } from '@/types/data'

  interface Props {
    isOpen?: boolean
    onSave: (entry: OmitBasicDataExcept<PaymentInfoData, 'TYPE'>) => void
    onCancel: () => void
  }

  const { isOpen = false, onSave, onCancel }: Props = $props()

  // Form state
  const form = $state({
    title: '',
    issuer: '',
    cardholderName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    notes: '',
  })

  // Form validation
  const isValid = $derived(
    !!(
      form.title.trim()
      && form.issuer.trim()
      && form.cardholderName.trim()
      && form.cardNumber.trim()
      && form.expiryDate.trim()
      && form.cvv.trim()
    ),
  )

  function handleSubmit() {
    if (!isValid) {
      return
    }

    onSave({
      _type: DataMetaType.PAYMENT,
      title: form.title.trim(),
      issuer: form.issuer.trim(),
      cardholderName: form.cardholderName.trim(),
      cardNumber: form.cardNumber.trim(),
      expiryDate: form.expiryDate.trim(),
      cvv: form.cvv.trim(),
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

            <!-- Issuer -->
            <label class='label' for='issuer'>
              {i18n.t('forms.issuer')} *
            </label>
            <input
              id='issuer'
              type='text'
              bind:value={form.issuer}
              placeholder={i18n.t('forms.issuerPlaceholder')}
              class='input w-full font-mono'
              required
            />

            <!-- Cardholder Name -->
            <label class='label' for='cardholder-name'>
              {i18n.t('forms.cardholderName')} *
            </label>
            <input
              id='cardholder-name'
              type='text'
              bind:value={form.cardholderName}
              placeholder={i18n.t('forms.cardholderNamePlaceholder')}
              class='input w-full font-mono'
              required
            />

            <!-- Card Number -->
            <label class='label' for='card-number'>
              {i18n.t('forms.cardNumber')} *
            </label>
            <input
              id='card-number'
              type='text'
              bind:value={form.cardNumber}
              placeholder={i18n.t('forms.cardNumberPlaceholder')}
              class='input w-full font-mono'
              required
            />

            <!-- Expiry Date -->
            <label class='label' for='expiry-date'>
              {i18n.t('forms.expiryDate')} *
            </label>
            <input
              id='expiry-date'
              type='text'
              bind:value={form.expiryDate}
              placeholder={i18n.t('forms.expiryDatePlaceholder')}
              class='input w-full font-mono'
              required
            />

            <!-- CVV/CVC -->
            <label class='label' for='cvv'>
              {i18n.t('forms.cvv')} *
            </label>
            <input
              id='cvv'
              type='text'
              bind:value={form.cvv}
              placeholder={i18n.t('forms.cvvPlaceholder')}
              class='input w-full font-mono'
              required
            />

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
