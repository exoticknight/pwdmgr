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

  // Card number formatting and handling
  function formatCardNumber(value: string): string {
    const digitsOnly = value.replace(/\D/g, '')
    return digitsOnly.replace(/(\d{4})(?=\d)/g, '$1 ')
  }

  function handleCardNumberInput(e: Event) {
    const input = e.currentTarget as HTMLInputElement
    const digitsOnly = input.value.replace(/\D/g, '')

    form.cardNumber = digitsOnly
    input.value = formatCardNumber(digitsOnly)
  }

  // CVV handling
  function handleCvvInput(e: Event) {
    const input = e.currentTarget as HTMLInputElement
    const digitsOnly = input.value.replace(/\D/g, '')

    form.cvv = digitsOnly
    input.value = digitsOnly
  }

  // Expiry date formatting and handling
  let isDeletingExpiryDate = $state(false)

  function formatExpiryDate(value: string): string {
    const digitsOnly = value.replace(/\D/g, '')
    if (digitsOnly.length < 2) {
      return digitsOnly
    }
    if (digitsOnly.length === 2) {
      return `${digitsOnly}/`
    }
    return `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2, 4)}`
  }

  function handleExpiryDateKeyDown(e: KeyboardEvent) {
    if (e.key === 'Backspace' || e.key === 'Delete') {
      isDeletingExpiryDate = true
    }
    else if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) {
      e.preventDefault()
    }
  }

  function handleExpiryDateInput(e: Event) {
    const input = e.currentTarget as HTMLInputElement
    let digitsOnly = input.value.replace(/\D/g, '').slice(0, 4)
    const oldDigitsOnly = (form.expiryDate || '').replace(/\D/g, '')

    if (isDeletingExpiryDate && oldDigitsOnly.length === 2 && digitsOnly.length === 2) {
      digitsOnly = digitsOnly.slice(0, 1)
    }

    form.expiryDate = digitsOnly
    input.value = formatExpiryDate(digitsOnly)

    isDeletingExpiryDate = false
  }

  function preventCursorMovement(e: KeyboardEvent) {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) {
      e.preventDefault()
    }
  }

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
              inputmode='numeric'
              value={formatCardNumber(form.cardNumber || '')}
              oninput={handleCardNumberInput}
              onkeydown={preventCursorMovement}
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
              inputmode='numeric'
              value={formatExpiryDate(form.expiryDate || '')}
              oninput={handleExpiryDateInput}
              onkeydown={handleExpiryDateKeyDown}
              placeholder={i18n.t('forms.expiryDatePlaceholder')}
              class='input w-full font-mono'
              maxlength='5'
              required
            />

            <!-- CVV/CVC -->
            <label class='label' for='cvv'>
              {i18n.t('forms.cvv')} *
            </label>
            <input
              id='cvv'
              type='text'
              inputmode='numeric'
              value={form.cvv || ''}
              oninput={handleCvvInput}
              onkeydown={preventCursorMovement}
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
