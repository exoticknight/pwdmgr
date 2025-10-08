<script lang='ts'>
  import type { PaymentInfoData } from '@/types/data'

  import { Copy } from '@lucide/svelte'

  import { i18n } from '@/stores/i18n.svelte'

  interface Props {
    entry: PaymentInfoData
    formData: Partial<PaymentInfoData>
    onFieldChange: (field: string, value: string) => void
    onCopyToClipboard: (text: string) => void
  }

  const {
    entry,
    formData,
    onFieldChange,
    onCopyToClipboard,
  }: Props = $props()

  function formatCardNumber(value: string): string {
    const digitsOnly = value.replace(/\D/g, '')
    return digitsOnly.replace(/(\d{4})(?=\d)/g, '$1 ')
  }

  function handleCardNumberInput(e: Event) {
    const input = e.currentTarget as HTMLInputElement
    const digitsOnly = input.value.replace(/\D/g, '')
    onFieldChange('cardNumber', digitsOnly)
    input.value = formatCardNumber(digitsOnly)
  }

  function handleCvvInput(e: Event) {
    const input = e.currentTarget as HTMLInputElement
    const digitsOnly = input.value.replace(/\D/g, '')
    onFieldChange('cvv', digitsOnly)
    input.value = digitsOnly
  }

</script>

<div class='flex flex-col space-y-6'>
  <div class='card bg-base-200 shadow-sm'>
    <div class='card-body p-4'>
      <h3 class='card-title text-lg mb-4'>{i18n.t('forms.paymentInformation')}</h3>

      <!-- Issuer -->
      <label class='label' for='issuer-input'>
        {i18n.t('forms.issuer')}
      </label>
      <input
        id='issuer-input'
        type='text'
        class='input w-full'
        value={formData.issuer || ''}
        oninput={e => onFieldChange('issuer', e.currentTarget.value)}
        placeholder={i18n.t('forms.issuerPlaceholder')}
      />

      <!-- Cardholder Name -->
      <label class='label' for='cardholder-name-input'>
        {i18n.t('forms.cardholderName')}
      </label>
      <input
        id='cardholder-name-input'
        type='text'
        class='input w-full'
        value={formData.cardholderName || ''}
        oninput={e => onFieldChange('cardholderName', e.currentTarget.value)}
        placeholder={i18n.t('forms.cardholderNamePlaceholder')}
      />

      <!-- Card Number -->
      <label class='label' for='card-number-input'>
        {i18n.t('forms.cardNumber')}
      </label>
      <div class='join w-full'>
        <input
          id='card-number-input'
          type='text'
          inputmode='numeric'
          class='input join-item flex-1 font-mono'
          value={formatCardNumber(formData.cardNumber || '')}
          oninput={handleCardNumberInput}
          placeholder={i18n.t('forms.cardNumberPlaceholder')}
        />
        <div class='flex flex-col'>
          <button
            type='button'
            class='btn join-item'
            onclick={() => onCopyToClipboard(entry.cardNumber || '')}
            title={i18n.t('actions.copy')}
          >
            <Copy size={16} />
          </button>
        </div>
      </div>

      <!-- Expiry Date -->
      <label class='label' for='expiry-date-input'>
        {i18n.t('forms.expiryDate')}
      </label>
      <input
        id='expiry-date-input'
        type='text'
        class='input w-full font-mono'
        value={formData.expiryDate || ''}
        oninput={e => onFieldChange('expiryDate', e.currentTarget.value)}
        placeholder={i18n.t('forms.expiryDatePlaceholder')}
      />

      <!-- CVV/CVC -->
      <label class='label' for='cvv-input'>
        {i18n.t('forms.cvv')}
      </label>
      <div class='join w-full'>
        <input
          id='cvv-input'
          type='text'
          inputmode='numeric'
          class='input join-item flex-1 font-mono'
          value={formData.cvv || ''}
          oninput={handleCvvInput}
          placeholder={i18n.t('forms.cvvPlaceholder')}
        />
        <div class='flex flex-col'>
          <button
            type='button'
            class='btn join-item'
            onclick={() => onCopyToClipboard(entry.cvv || '')}
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
