<script lang='ts'>
  import type { OmitBasicDataExcept, PhoneData } from '@/types/data'

  import DatalistInput from '@/components/datalist-input.svelte'
  import Modal from '@/components/modal.svelte'
  import { COUNTRIES_PHONE_INFO, getCarriersByCountryCode, getCountryByCode, getCountryByDialCode } from '@/consts/phone'
  import { i18n } from '@/stores/i18n.svelte'
  import { DataMetaType } from '@/types/data'

  interface Props {
    isOpen?: boolean
    onSave: (entry: OmitBasicDataExcept<PhoneData, 'TYPE'>) => void
    onCancel: () => void
  }

  const { isOpen = false, onSave, onCancel }: Props = $props()

  // Form state
  const form = $state({
    title: '',
    countryCode: 'CN',
    dialCode: '86',
    phoneNumber: '',
    carrier: '',
    notes: '',
  })

  // Get carriers for selected country
  const carriers = $derived(getCarriersByCountryCode(form.countryCode))

  // Get country info for display
  const countryInfo = $derived(getCountryByCode(form.countryCode))

  // Country options for datalist
  const countryOptions = $derived(COUNTRIES_PHONE_INFO.map(c => ({
    value: `+${c.dialCode}`,
    label: `${c.emoji} ${c.nameNative} (+${c.dialCode})`,
  })))

  // Carrier options for datalist
  const carrierOptions = $derived(carriers.map(c => ({
    value: c,
    label: c,
  })))

  // Form validation
  const isValid = $derived(
    !!(
      form.title.trim()
      && form.phoneNumber.trim()
    ),
  )

  function handleCountrySelect(option: { value: string, label: string }) {
    // value is in format "+XX", extract the dial code
    const dialCode = option.value.replace(/^\+/, '')
    const country = getCountryByDialCode(dialCode)
    if (country) {
      form.countryCode = country.code
      form.dialCode = country.dialCode
      // Clear carrier when country changes
      form.carrier = ''
    }
  }

  function handlePhoneNumberInput(e: Event) {
    const input = e.currentTarget as HTMLInputElement
    // Only allow digits, spaces, and dashes
    const cleaned = input.value.replace(/[^\d\s-]/g, '')
    form.phoneNumber = cleaned
  }

  function handleCarrierInput(value: string) {
    form.carrier = value
  }

  function handleSubmit() {
    if (!isValid) {
      return
    }

    onSave({
      _type: DataMetaType.PHONE,
      title: form.title.trim(),
      countryCode: form.countryCode,
      dialCode: form.dialCode,
      phoneNumber: form.phoneNumber.trim(),
      carrier: form.carrier.trim() || undefined,
      notes: form.notes.trim() || undefined,
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
            <!-- Title -->
            <label class='label' for='title'>
              {i18n.t('forms.title')} *
            </label>
            <input
              id='title'
              type='text'
              bind:value={form.title}
              placeholder={i18n.t('forms.phoneTitlePlaceholder')}
              class='input w-full'
              required
            />

            <!-- Country/Region + Phone Number -->
            <label class='label' for='phone-number'>
              {i18n.t('forms.phoneNumber')} *
            </label>
            <div class='join w-full'>
              <span class='join-item flex items-center px-2 bg-base-100 border border-base-300 text-lg'>
                {countryInfo?.emoji || '🌐'}
              </span>
              <div style='width: 5rem; flex-shrink: 0;'>
                <DatalistInput
                  id='country-input-new'
                  value={countryInfo ? `+${countryInfo.dialCode}` : ''}
                  placeholder='+86'
                  options={countryOptions}
                  onselect={handleCountrySelect}
                  class='join-item'
                  required
                />
              </div>
              <input
                id='phone-number'
                type='tel'
                inputmode='tel'
                value={form.phoneNumber}
                oninput={handlePhoneNumberInput}
                placeholder={i18n.t('forms.phoneNumberPlaceholder')}
                class='input join-item flex-1 font-mono'
                required
              />
            </div>

            <!-- Carrier -->
            <label class='label' for='carrier-input-new'>
              {i18n.t('forms.carrier')}
            </label>
            <DatalistInput
              id='carrier-input-new'
              value={form.carrier}
              placeholder={i18n.t('forms.carrierPlaceholder')}
              options={carrierOptions}
              oninput={handleCarrierInput}
            />

            <!-- Notes -->
            <label class='label' for='notes'>
              {i18n.t('forms.notes')}
            </label>
            <textarea
              id='notes'
              bind:value={form.notes}
              placeholder={i18n.t('forms.notesPlaceholder')}
              class='textarea textarea-bordered w-full'
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
