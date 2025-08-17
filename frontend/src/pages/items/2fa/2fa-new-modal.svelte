<script lang='ts'>
  import type { TwoFAData } from '@/types/2fa'
  import type { OmitBasicDataExcept, TwoFactorAuthData } from '@/types/data'
  import { Link, QrCode } from '@lucide/svelte'
  import Modal from '@/components/modal.svelte'
  import WailsFileSelect from '@/components/wails-file-select.svelte'
  import { Client2FAService } from '@/services/2fa-client'
  import { getFile } from '@/services/file'
  import { QRScannerService } from '@/utils/qr-scanner'
  import { TOTPGenerator } from '@/utils/totp'

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

  // Error messages
  let errorMessage = $state('')
  let isLoading = $state(false)

  // Input fields
  let urlInput = $state('')

  // Reset form
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

  // Close modal
  function handleClose() {
    resetForm()
    onCancel()
  }

  // Fill form from QR data
  function fillForm(twoFAData: TwoFAData) {
    const partial = Client2FAService.createFrom2FAData(twoFAData)
    formData = { ...formData, ...partial }

    handleSave()
  }

  // Handle image upload
  async function handleImageUpload(filePaths: string[]) {
    if (!filePaths || filePaths.length === 0) {
      return
    }

    const filePath = filePaths[0]
    isLoading = true
    errorMessage = ''

    try {
      // Use file service to read file
      const fileService = getFile()
      const arrayBuffer = await fileService.readFile(filePath)

      // Convert ArrayBuffer to Blob
      const blob = new Blob([arrayBuffer])

      // Get file extension to determine MIME type
      const fileName = filePath.split(/[/\\]/).pop() || 'image'
      const extension = fileName.split('.').pop()?.toLowerCase() || ''
      let mimeType = 'image/jpeg' // Default type

      if (extension === 'png') {
        mimeType = 'image/png'
      }
      else if (extension === 'gif') {
        mimeType = 'image/gif'
      }
      else if (extension === 'bmp') {
        mimeType = 'image/bmp'
      }
      else if (extension === 'webp') {
        mimeType = 'image/webp'
      }

      // Create File object
      const file = new File([blob], fileName, { type: mimeType })

      const qrResults = await QRScannerService.scanFromImage(file)

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
      const twoFAData = TOTPGenerator.parseURI(urlInput.trim())
      fillForm(twoFAData)
    }
    catch (error) {
      console.error('Failed to parse URL:', error)
      errorMessage = 'Invalid otpauth:// URL format'
    }
  }

  // Handle clipboard scanning
  async function handleClipboardScan() {
    isLoading = true
    errorMessage = ''

    try {
      const qrResults = await QRScannerService.scanFromClipboard()

      if (qrResults.length === 0) {
        errorMessage = 'No QR code found in clipboard'
      }
      else {
        fillForm(qrResults[0])
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

  // Validate and save
  function handleSave() {
    try {
      Client2FAService.validate2FAData(formData)
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

{#if isOpen}
  <Modal
    {isOpen}
    title='Add Two-Factor Authentication'
    onClose={handleClose}
    boxClass='max-w-2xl'
  >
    {#snippet children()}
      <!-- 输入模式切换 -->
      <div class='tabs tabs-lift mb-6'>
        <label class='tab'>
          <input type='radio' name='2fa_input_tabs' checked />
          <QrCode class='w-4 h-4 mr-2' />
          QR Code
        </label>
        <div class='tab-content bg-base-100 border-base-300 p-4'>
          <div class='flex flex-col'>
            <WailsFileSelect
              title='Select QR Code Image'
              filters={[
                { displayName: 'Image Files', pattern: '*.jpg;*.jpeg;*.png;*.gif;*.bmp;*.webp' },
                { displayName: 'All Files', pattern: '*.*' },
              ]}
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
                        {isDragOver ? 'Drop image here' : 'Click to select or drag & drop'}
                      </p>
                      <p class='text-sm text-base-content/60'>
                        Select a QR code image from your device
                      </p>
                    </div>
                  </div>
                </div>
              {/snippet}
            </WailsFileSelect>

            <div class='divider'>OR</div>

            <button
              class='btn btn-outline'
              onclick={handleClipboardScan}
            >
              Scan Image from Clipboard
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
              Add
            </button>
          </div>
        </div>
      </div>

      <!-- 错误信息 -->
      {#if errorMessage}
        <div class='alert alert-error mb-4'>
          {errorMessage}
        </div>
      {/if}

      <!-- 加载状态 -->
      {#if isLoading}
        <div class='flex items-center justify-center p-8'>
          <span class='loading loading-spinner loading-lg'></span>
          <span class='ml-4'>Processing...</span>
        </div>
      {:else}
        <!-- 按钮 -->
        <div class='modal-action'>
          <button
            class='btn'
            onclick={handleClose}
          >
            Cancel
          </button>
        </div>
      {/if}
    {/snippet}
  </Modal>
{/if}
