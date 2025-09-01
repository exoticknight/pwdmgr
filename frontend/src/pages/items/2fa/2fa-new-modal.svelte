<script lang='ts'>
  import type { HOTP, TOTP } from 'otpauth'
  import type { OmitBasicDataExcept, TwoFactorAuthData } from '@/types/data'
  import { Link, QrCode } from '@lucide/svelte'
  import Modal from '@/components/modal.svelte'
  import WailsFileSelect from '@/components/wails-file-select.svelte'
  import { getIoService } from '@/services/io'
  import { i18n } from '@/stores/i18n.svelte'
  import { createFrom2FAData, parseURI, validate2FAData } from '@/utils/2fa'
  import { readFromClipboard } from '@/utils/clipboard'
  import { QRScannerService } from '@/utils/qr-scanner'

  interface Props {
    isOpen: boolean
    onCancel: () => void
    onSave: (entry: OmitBasicDataExcept<TwoFactorAuthData, 'TYPE'>) => void
  }

  const { isOpen, onCancel, onSave }: Props = $props()

  // Form data
  let formData = $state<Partial<TwoFactorAuthData>>({
    title: '',
    issuer: '',
    username: '',
    secret: '',
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    notes: '',
    serviceUrl: '',
  })

  let errorMessage = $state('')
  let isLoading = $state(false)

  let urlInput = $state('')

  function resetForm() {
    formData = {
      title: '',
      issuer: '',
      username: '',
      secret: '',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      notes: '',
      serviceUrl: '',
    }
    errorMessage = ''
    urlInput = ''
  }

  function handleClose() {
    resetForm()
    onCancel()
  }

  function fillForm(twoFAData: TOTP | HOTP) {
    const partial = createFrom2FAData(twoFAData)
    formData = { ...formData, ...partial }

    handleSave()
  }

  async function handleImageUpload(filePaths: string[]) {
    if (!filePaths || filePaths.length === 0) {
      return
    }

    const filePath = filePaths[0]
    isLoading = true
    errorMessage = ''

    try {
      // Use file service to read file
      const content = await getIoService().readFile(filePath)

      // Convert ArrayBuffer to Blob
      const blob = new Blob([new Uint8Array(content)])

      const qrResults = await QRScannerService.scanFromBlob(blob)

      if (qrResults.length === 0) {
        errorMessage = 'No QR code found in the image'
      }
      else {
        fillForm(qrResults[0])
      }
    }
    catch (error) {
      console.error('Failed to scan QR code:', error)
      errorMessage = 'Failed to scan QR code from image'
    }
    finally {
      isLoading = false
    }
  }

  // Handle URL input
  function handleUrlSubmit() {
    if (!urlInput.trim()) {
      errorMessage = 'Please enter a valid otpauth:// URL'
      return
    }

    try {
      const twoFAData = parseURI(urlInput.trim())
      fillForm(twoFAData)
    }
    catch (error) {
      console.error('Failed to parse URL:', error)
      errorMessage = 'Invalid otpauth:// URL format'
    }
  }

  async function handleClipboardScan() {
    isLoading = true
    errorMessage = ''

    try {
      const clipboardItems = await readFromClipboard()
      const results: (import('otpauth').TOTP | import('otpauth').HOTP)[] = []

      for (const clipboardItem of clipboardItems) {
        for (const type of clipboardItem.types) {
          if (type.startsWith('image/')) {
            const blob = await clipboardItem.getType(type)
            const qrResults = await QRScannerService.scanFromBlob(blob)
            results.push(...qrResults)
          }
        }
      }

      if (results.length === 0) {
        errorMessage = 'No QR code found in clipboard'
      }
      else {
        fillForm(results[0])
      }
    }
    catch (error) {
      console.error('Failed to scan clipboard:', error)
      errorMessage = 'Failed to scan QR code from clipboard'
    }
    finally {
      isLoading = false
    }
  }

  function handleSave() {
    try {
      validate2FAData(formData)
    }
    catch (error) {
      errorMessage = error instanceof Error ? error.message : 'Validation failed'
      console.error('Validation error:', errorMessage)
      return
    }

    // Create entry that meets type requirements
    const entry: OmitBasicDataExcept<TwoFactorAuthData, 'TYPE'> = {
      _type: 'two_factor_auth',
      title: formData.title!,
      issuer: formData.issuer!,
      username: formData.username!,
      secret: formData.secret!,
      algorithm: formData.algorithm!,
      digits: formData.digits!,
      period: formData.period!,
      notes: formData.notes,
      serviceUrl: formData.serviceUrl,
      iconUrl: formData.iconUrl,
    }

    onSave?.(entry)
    handleClose()
  }
</script>

<Modal
  {isOpen}
  title={i18n.t('twofa.new')}
  onClose={handleClose}
  boxClass='max-w-2xl'
>
  {#snippet children()}
    <div class='tabs tabs-lift mb-6'>
      <label class='tab'>
        <input type='radio' name='2fa_input_tabs' checked />
        <QrCode class='w-4 h-4 mr-2' />
        QR Code
      </label>
      <div class='tab-content bg-base-100 border-base-300 p-4'>
        <div class='flex flex-col'>
          <WailsFileSelect
            title={i18n.t('twofa.selectQrCodeImage')}
            filters={[
              { displayName: 'Image Files', pattern: '*.jpg;*.jpeg;*.png;*.gif;*.bmp;*.webp' },
              { displayName: 'All Files', pattern: '*.*' },
            ]}
            mode='open'
            multiple={false}
            enableDrop={true}
            onSelect={handleImageUpload}
            disabled={isLoading}
          >
            {#snippet children({ isDragOver, isDisabled })}
              <div class={`p-4 border-2 border-dashed rounded-lg transition-colors ${
                isDragOver ? 'border-primary bg-primary/10' : 'border-base-300'
              } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary/50'}`}>
                <div class='flex flex-col items-center gap-2'>
                  <QrCode class='w-8 h-8 text-base-content/60' />
                  <div class='text-center'>
                    <p class='font-medium'>
                      {isDragOver ? i18n.t('twofa.dropHere') : i18n.t('twofa.clickToSelect')}
                    </p>
                    <p class='text-sm text-base-content/60'>
                      {i18n.t('twofa.instructions')}
                    </p>
                  </div>
                </div>
              </div>
            {/snippet}
          </WailsFileSelect>

          <div class='divider'>{i18n.t('common.or')}</div>

          <button
            class='btn btn-outline'
            onclick={handleClipboardScan}
          >
            {i18n.t('twofa.scanClipboard')}
          </button>
        </div>
      </div>

      <label class='tab'>
        <input type='radio' name='2fa_input_tabs' />
        <Link class='w-4 h-4 mr-2' />
        OTP Auth URL
      </label>
      <div class='tab-content bg-base-100 border-base-300 p-4'>
        <div class='flex gap-2'>
          <input
            type='text'
            class='input input-bordered flex-1'
            placeholder='otpauth://totp/...'
            bind:value={urlInput}
          />
          <button
            type='button'
            class='btn btn-primary'
            onclick={handleUrlSubmit}
          >
            {i18n.t('actions.add')}
          </button>
        </div>
      </div>
    </div>

    {#if errorMessage}
      <div class='alert alert-error mb-4'>
        {errorMessage}
      </div>
    {/if}

    {#if isLoading}
      <div class='flex items-center justify-center p-8'>
        <span class='loading loading-spinner loading-lg'></span>
        <span class='ml-4'>{i18n.t('actions.processing')}</span>
      </div>
    {/if}
  {/snippet}
</Modal>
