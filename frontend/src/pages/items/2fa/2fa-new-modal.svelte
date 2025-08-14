<script lang='ts'>
  import type { QRCodeData } from '../../../types/2fa'
  import type { OmitBasicDataExcept, TwoFactorAuthData } from '../../../types/data'
  import { Link, Plus, Upload } from '@lucide/svelte'
  import Modal from '../../../components/modal.svelte'
  import { Client2FAService } from '../../../services/2fa-client'
  import { QRScannerService } from '../../../utils/qr-scanner'
  import { TOTPGenerator } from '../../../utils/totp'

  interface Props {
    isOpen: boolean
    onCancel: () => void
    onSave: (entry: OmitBasicDataExcept<TwoFactorAuthData, 'TYPE'>) => void
  }

  const { isOpen, onCancel, onSave }: Props = $props()

  // 表单数据
  let formData = $state<Partial<TwoFactorAuthData>>({
    title: '',
    issuer: '',
    accountName: '',
    secret: '',
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    notes: '',
    serviceUrl: '',
  })

  // 错误信息
  let errors = $state<string[]>([])
  let isLoading = $state(false)

  // 输入字段
  let urlInput = $state('')
  let fileInput: HTMLInputElement | null = $state(null)

  // 重置表单
  function resetForm() {
    formData = {
      title: '',
      issuer: '',
      accountName: '',
      secret: '',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      notes: '',
      serviceUrl: '',
    }
    errors = []
    urlInput = ''
  }

  // 关闭模态框
  function handleClose() {
    resetForm()
    onCancel()
  }

  // 从QR数据填充表单
  function fillFormFromQR(qrData: QRCodeData) {
    const partial = Client2FAService.createFrom2FAData(qrData)
    formData = { ...formData, ...partial }

    // 自动更新标题
    updateTitle()
  }

  // 更新标题
  function updateTitle() {
    if (formData.issuer && formData.accountName) {
      formData.title = `${formData.issuer} - ${formData.accountName}`
    }
  }

  // 处理图片上传
  async function handleImageUpload(event: Event) {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]

    if (!file) {
      return
    }

    isLoading = true
    errors = []

    try {
      const qrResults = await QRScannerService.scanFromImage(file)

      if (qrResults.length === 0) {
        errors = ['No QR code found in the image']
      }
      else {
        fillFormFromQR(qrResults[0])
      }
    }
    catch (error) {
      console.error('Failed to scan QR code:', error)
      errors = ['Failed to scan QR code from image']
    }
    finally {
      isLoading = false
      // 清空文件输入
      if (input) {
        input.value = ''
      }
    }
  }

  // 处理URL输入
  function handleUrlSubmit() {
    if (!urlInput.trim()) {
      errors = ['Please enter a valid otpauth:// URL']
      return
    }

    try {
      const qrData = QRScannerService.parseOtpauthURL(urlInput.trim())
      fillFormFromQR(qrData)
      errors = []
    }
    catch (error) {
      console.error('Failed to parse URL:', error)
      errors = ['Invalid otpauth:// URL format']
    }
  }

  // 处理剪贴板扫描
  async function handleClipboardScan() {
    isLoading = true
    errors = []

    try {
      const qrResults = await QRScannerService.scanFromClipboard()

      if (qrResults.length === 0) {
        errors = ['No QR code found in clipboard']
      }
      else {
        fillFormFromQR(qrResults[0])
      }
    }
    catch (error) {
      console.error('Failed to scan clipboard:', error)
      errors = ['Failed to scan QR code from clipboard']
    }
    finally {
      isLoading = false
    }
  }

  // 生成随机密钥
  function generateRandomSecret() {
    formData.secret = TOTPGenerator.generateSecret()
  }

  // 验证并保存
  function handleSave() {
    const validationErrors = Client2FAService.validate2FAData(formData)

    if (validationErrors.length > 0) {
      errors = validationErrors
      return
    }

    // 创建符合类型要求的entry
    const entry: OmitBasicDataExcept<TwoFactorAuthData, 'TYPE'> = {
      _type: 'two_factor_auth',
      title: formData.title!,
      issuer: formData.issuer!,
      accountName: formData.accountName!,
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
          <Plus class='w-4 h-4 mr-2' />
          Manual Entry
        </label>
        <div class='tab-content bg-base-100 border-base-300 p-4'>
          <!-- 手动输入表单 -->
          <div class='form-control space-y-4'>
            <div class='grid grid-cols-2 gap-4'>
              <div class='form-control'>
                <label class='label'>
                  <span class='label-text'>Service Provider *</span>
                </label>
                <input
                  type='text'
                  class='input input-bordered'
                  placeholder='e.g. Google, GitHub'
                  bind:value={formData.issuer}
                />
              </div>

              <div class='form-control'>
                <label class='label'>
                  <span class='label-text'>Account Name *</span>
                </label>
                <input
                  type='text'
                  class='input input-bordered'
                  placeholder='e.g. user@example.com'
                  bind:value={formData.accountName}
                />
              </div>
            </div>

            <div class='form-control'>
              <label class='label'>
                <span class='label-text'>Title</span>
              </label>
              <input
                type='text'
                class='input input-bordered'
                bind:value={formData.title}
              />
            </div>

            <div class='form-control'>
              <label class='label'>
                <span class='label-text'>Secret Key *</span>
              </label>
              <div class='flex gap-2'>
                <input
                  type='text'
                  class='input input-bordered flex-1'
                  placeholder='Base32 encoded secret'
                  bind:value={formData.secret}
                />
                <button
                  type='button'
                  class='btn btn-outline'
                  onclick={generateRandomSecret}
                  title='Generate random secret'
                >
                  Generate
                </button>
              </div>
            </div>

            <div class='grid grid-cols-3 gap-4'>
              <div class='form-control'>
                <label class='label'>
                  <span class='label-text'>Algorithm</span>
                </label>
                <select class='select select-bordered' bind:value={formData.algorithm}>
                  <option value='SHA1'>SHA1</option>
                  <option value='SHA256'>SHA256</option>
                  <option value='SHA512'>SHA512</option>
                </select>
              </div>

              <div class='form-control'>
                <label class='label'>
                  <span class='label-text'>Digits</span>
                </label>
                <select class='select select-bordered' bind:value={formData.digits}>
                  <option value={6}>6</option>
                  <option value={8}>8</option>
                </select>
              </div>

              <div class='form-control'>
                <label class='label'>
                  <span class='label-text'>Period (seconds)</span>
                </label>
                <input
                  type='number'
                  class='input input-bordered'
                  min='1'
                  max='300'
                  bind:value={formData.period}
                />
              </div>
            </div>

            <div class='form-control'>
              <label class='label'>
                <span class='label-text'>Notes</span>
              </label>
              <textarea
                class='textarea textarea-bordered h-20'
                placeholder='Optional notes'
                bind:value={formData.notes}
              ></textarea>
            </div>
          </div>
        </div>

        <label class='tab'>
          <input type='radio' name='2fa_input_tabs' />
          <Upload class='w-4 h-4 mr-2' />
          Upload Image
        </label>
        <div class='tab-content bg-base-100 border-base-300 p-4'>
          <!-- 图片上传 -->
          <div class='form-control'>
            <label class='label'>
              <span class='label-text'>Upload QR Code Image</span>
            </label>
            <input
              type='file'
              class='file-input file-input-bordered w-full'
              accept='image/*'
              bind:this={fileInput}
              onchange={handleImageUpload}
            />
            <div class='label'>
              <span class='label-text-alt'>
                Select a QR code image from your device
              </span>
            </div>
          </div>

          <!-- 剪贴板选项 -->
          <div class='divider'>OR</div>
          <div class='flex justify-center'>
            <button
              class='btn btn-outline'
              onclick={handleClipboardScan}
            >
              <Upload class='w-4 h-4 mr-2' />
              Scan from Clipboard
            </button>
          </div>
        </div>

        <label class='tab'>
          <input type='radio' name='2fa_input_tabs' />
          <Link class='w-4 h-4 mr-2' />
          Paste URL
        </label>
        <div class='tab-content bg-base-100 border-base-300 p-4'>
          <!-- URL输入 -->
          <div class='form-control'>
            <label class='label'>
              <span class='label-text'>OTP Auth URL</span>
            </label>
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
                Parse
              </button>
            </div>
            <div class='label'>
              <span class='label-text-alt'>
                Paste the otpauth:// URL from your authenticator app
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 错误信息 -->
      {#if errors.length > 0}
        <div class='alert alert-error mb-4'>
          <ul>
            {#each errors as error}
              <li>{error}</li>
            {/each}
          </ul>
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
          <button
            class='btn btn-primary'
            onclick={handleSave}
            disabled={!formData.issuer || !formData.accountName || !formData.secret}
          >
            Add 2FA Entry
          </button>
        </div>
      {/if}
    {/snippet}
  </Modal>
{/if}
