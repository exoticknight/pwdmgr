<script lang='ts'>
  import type { PhoneData } from '@/types/data'

  import { Copy } from '@lucide/svelte'

  import DatalistInput from '@/components/datalist-input.svelte'
  import { COUNTRIES_PHONE_INFO, getCarriersByCountryCode, getCountryByCode, getCountryByDialCode } from '@/consts/phone'
  import { i18n } from '@/stores/i18n.svelte'

  import DetailCard from '../detail-card.svelte'

  interface Props {
    entry: PhoneData
    formData: Partial<PhoneData>
    onFieldChange: (field: string, value: string) => void
    onCopyToClipboard: (text: string) => void
  }

  const {
    entry,
    formData,
    onFieldChange,
    onCopyToClipboard,
  }: Props = $props()

  // Get country info for display
  const countryInfo = $derived(getCountryByCode(formData.countryCode || entry.countryCode || 'CN'))

  // Country options for datalist
  const countryOptions = $derived(COUNTRIES_PHONE_INFO.map(c => ({
    value: `+${c.dialCode}`,
    label: `${c.emoji} ${c.nameNative} (+${c.dialCode})`,
  })))

  // Get carriers for selected country
  const carriers = $derived(getCarriersByCountryCode(formData.countryCode || entry.countryCode || 'CN'))

  // Carrier options for datalist
  const carrierOptions = $derived(carriers.map(c => ({
    value: c,
    label: c,
  })))

  // Format full phone number for display and copy
  const fullPhoneNumber = $derived(() => {
    const dialCode = formData.dialCode || entry.dialCode || ''
    const phoneNumber = formData.phoneNumber || entry.phoneNumber || ''
    return dialCode && phoneNumber ? `+${dialCode} ${phoneNumber}` : phoneNumber
  })

  function handleCountrySelect(option: { value: string, label: string }) {
    // value is in format "+XX", extract the dial code
    const dialCode = option.value.replace(/^\+/, '')
    const country = getCountryByDialCode(dialCode)
    if (country) {
      onFieldChange('countryCode', country.code)
      onFieldChange('dialCode', country.dialCode)
      // Clear carrier when country changes
      onFieldChange('carrier', '')
    }
  }

  function handlePhoneNumberInput(e: Event) {
    const input = e.currentTarget as HTMLInputElement
    // Only allow digits, spaces, and dashes
    const cleaned = input.value.replace(/[^\d\s-]/g, '')
    onFieldChange('phoneNumber', cleaned)
  }

  function handleCarrierInput(value: string) {
    onFieldChange('carrier', value)
  }
</script>

<DetailCard title={i18n.t('forms.phoneInformation')}>
  <!-- Country/Region + Phone Number -->
  <label class='label' for='phone-number-input'>
    {i18n.t('forms.phoneNumber')}
  </label>
  <div class='join w-full'>
    <div style='width: 5rem; flex-shrink: 0;'>
      <DatalistInput
        id='country-input'
        value={countryInfo ? `+${countryInfo.dialCode}` : ''}
        placeholder='+86'
        options={countryOptions}
        onselect={handleCountrySelect}
        class='join-item'
      />
    </div>
    <input
      id='phone-number-input'
      type='tel'
      inputmode='tel'
      class='input join-item flex-1 font-mono'
      value={formData.phoneNumber || ''}
      oninput={handlePhoneNumberInput}
      placeholder={i18n.t('forms.phoneNumberPlaceholder')}
    />
    <button
      type='button'
      class='btn join-item'
      onclick={() => onCopyToClipboard(fullPhoneNumber())}
      title={i18n.t('actions.copy')}
    >
      <Copy size={16} />
    </button>
  </div>

  <!-- Carrier -->
  <label class='label' for='carrier-input'>
    {i18n.t('forms.carrier')}
  </label>
  <DatalistInput
    id='carrier-input'
    value={formData.carrier || ''}
    placeholder={i18n.t('forms.carrierPlaceholder')}
    options={carrierOptions}
    oninput={handleCarrierInput}
  />
</DetailCard>

<DetailCard title={i18n.t('forms.additionalInformation')}>
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
</DetailCard>
