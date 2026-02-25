<script lang='ts'>
  import { FileLock, Key, Plus } from '@lucide/svelte'

  import App2FAVerifyForm from '@/components/app-2fa-verify-form.svelte'
  import LanguageSelector from '@/components/language-selector.svelte'

  import WailsFileSelect from '@/components/wails-file-select.svelte'
  import { authenticate, generateAuthenticationOptions, isSupported as isFidoSupported } from '@/services/fido'
  import { getFileService } from '@/services/file'
  import { getIoService } from '@/services/io'

  import { app } from '@/stores/app.svelte'
  import { database } from '@/stores/database.svelte'
  import { i18n } from '@/stores/i18n.svelte'
  import { navigation } from '@/stores/navigation.svelte'
  import { notification } from '@/stores/notification.svelte'
  import { route, Routes } from '@/stores/route.svelte'
  import { setting } from '@/stores/setting.svelte'
  import PasswordForm from './landing/password-form.svelte'
  import RecoveryCodeModal from './landing/recovery-code-modal.svelte'

  let password = $state('')
  let confirmPassword = $state('')
  let isLoading = $state(false)
  let isRecoverable = $state(false)

  let showPasswordInput = $state(false)
  let show2FAVerification = $state(false)
  let isNewDatabase = $state(false)
  let selectedFilePath = $state<string | null>(null)

  // FIDO 相关状态
  let fidoSupported = $state(false)
  let fidoDevices = $state<Array<{ id: string, name: string }>>([])
  let showFidoSelect = $state(false)
  let isFidoAuthenticating = $state(false)
  let currentKeyData = $state<any>(null)
  let pendingFidoAuth = $state<{ deviceId: string } | null>(null)
  let pendingFidoAsSecondFactor = $state(false)

  async function handleFileSelected(filePath: string) {
    isNewDatabase = false
    selectedFilePath = filePath

    // 读取文件获取 keyData（不解密）
    try {
      const content = await getIoService().readFile(filePath)
      const file = await getFileService().load(content)
      currentKeyData = file.keyData

      // 检查 FIDO 设备
      fidoDevices = file.keyData.fido?.devices?.map(d => ({ id: d.id, name: d.name })) ?? []
      fidoSupported = isFidoSupported() && fidoDevices.length > 0

      // 如果有 FIDO 设备且启用了，尝试自动认证
      if (fidoSupported && setting.data.security.fidoEnabled) {
        // 检查是否可以直接用 FIDO 登录（不需要密码）
        if (setting.data.security.fidoAsPrimary) {
          // 尝试自动 FIDO 认证
          await tryFidoAuth()
          return
        }
      }

      // 否则显示密码输入
      showPasswordInput = true
    }
    catch (error) {
      console.error('Failed to read file:', error)
      notification.error(i18n.t('messages.loadDatabaseFileFailed'))
    }
  }

  // 尝试 FIDO 认证
  async function tryFidoAuth() {
    if (fidoDevices.length === 0) {
      showPasswordInput = true
      return
    }

    isFidoAuthenticating = true

    try {
      // 如果有多个设备，显示选择界面
      if (fidoDevices.length > 1) {
        showFidoSelect = true
        isFidoAuthenticating = false
        return
      }

      // 单设备直接认证
      const device = fidoDevices[0]
      await authenticateWithFido(device.id)
    }
    catch (error) {
      console.error('FIDO authentication failed:', error)
      // FIDO 失败，回退到密码输入
      showPasswordInput = true
    }
    finally {
      isFidoAuthenticating = false
    }
  }

  // 使用指定设备进行 FIDO 认证
  async function authenticateWithFido(deviceId: string) {
    isFidoAuthenticating = true
    showFidoSelect = false

    try {
      const device = currentKeyData.fido?.devices?.find((d: any) => d.id === deviceId)
      if (!device) {
        throw new Error('Device not found')
      }

      // 生成认证选项
      const options = generateAuthenticationOptions(device.credentialId)

      // 调用 WebAuthn 认证
      const response = await authenticate(options)

      // WebAuthn 验证成功（用户已通过设备验证）
      if (response && response.id) {
        // 检查是否是 fidoAsSecondFactor 模式（密码后用 FIDO 替代 2FA）
        if (pendingFidoAsSecondFactor) {
          // FIDO 验证成功，直接进入主页面
          pendingFidoAsSecondFactor = false
          route.navigate(navigation.visibleItems.at(0)?.route || Routes.ITEMS_ALL)
          return
        }

        // 检查是否是 fidoAsPrimary 模式（不需要密码）
        if (setting.data.security.fidoAsPrimary) {
          // 直接用 FIDO 设备存储的 encryptedMasterKey 解密
          // 需要读取文件获取设备信息
          const content = await getIoService().readFile(selectedFilePath!)
          const file = await getFileService().load(content)
          const fidoDevice = file.keyData.fido?.devices?.find((d: any) => d.id === deviceId)

          if (fidoDevice) {
            // 这里需要密码来解密 master key，所以还是需要密码
            // 但如果是真正的无密码模式，需要重新设计
            // 暂时还是需要密码来解密
            pendingFidoAuth = { deviceId }
            showPasswordInput = true
          }
          else {
            notification.error(i18n.t('fido.deviceNotFound'))
            showPasswordInput = true
          }
        }
        else {
          // 普通模式：保存待处理的 FIDO 认证信息，等待用户输入密码
          pendingFidoAuth = { deviceId }
          showPasswordInput = true
        }
      }
      else {
        notification.error(i18n.t('fido.authFailed'))
        showPasswordInput = true
      }
    }
    catch (error: any) {
      console.error('FIDO auth error:', error)
      // 用户取消或失败，回退到密码
      if (error.message?.includes('cancel') || error.name === 'NotAllowedError') {
        showPasswordInput = true
      }
      else {
        notification.error(error.message || i18n.t('fido.authFailed'))
        showPasswordInput = true
      }
    }
    finally {
      isFidoAuthenticating = false
    }
  }

  function usePasswordInstead() {
    showFidoSelect = false
    showPasswordInput = true
  }
  function handleFilesSelected(filePaths: string[]) {
    if (filePaths.length > 0) {
      handleFileSelected(filePaths[0])
    }
  }

  let isRecoveryCodeModalOpen = $state(false)
  function handleRecoveryOpen() {
    isRecoveryCodeModalOpen = true
  }
  function handleRecoveryClose() {
    isRecoveryCodeModalOpen = false
  }
  function handleRecovery() {
    isRecoveryCodeModalOpen = false
  }

  function createNewDatabase() {
    isNewDatabase = true
    selectedFilePath = null
    showPasswordInput = true
  }

  async function handlePasswordSubmit(event: SubmitEvent) {
    event.preventDefault()
    if (!password) {
      notification.error(i18n.t('errors.passwordRequired'))
      return
    }

    if (isNewDatabase && password !== confirmPassword) {
      notification.error(i18n.t('errors.passwordMismatch'))
      return
    }

    await processDatabase()
  }

  async function processDatabase() {
    try {
      isLoading = true

      if (selectedFilePath) {
        const content = await getIoService().readFile(selectedFilePath)
        const file = await getFileService().load(content)

        // 检查恢复码是否启用（非零表示已启用）
        if (file.keyData.recovery?.encryptedMasterKey.some(b => b !== 0)) {
          isRecoverable = true
        }

        // 如果有 pending FIDO 认证，使用设备的 encryptedMasterKey
        if (pendingFidoAuth) {
          const device = file.keyData.fido?.devices?.find((d: any) => d.id === pendingFidoAuth.deviceId)
          if (device) {
            // 用密码解密设备的 encryptedMasterKey
            const { decryptDataWithKey } = await import('@/services/key')
            const masterKey = await decryptDataWithKey(
              password,
              device.passwordSalt,
              device.passwordIv,
              device.encryptedMasterKey,
            )
            await database.loadFromFileWithMasterKey(file, masterKey)
            pendingFidoAuth = null
          }
          else {
            // 设备找不到，回退到常规登录
            await database.loadFromFile(file, password)
          }
        }
        else {
          await database.loadFromFile(file, password)
        }

        app.dbPath = selectedFilePath
      }
      else if (isNewDatabase) {
        await database.loadFromScratch(password)
        app.dbPath = ''
      }

      // Check if 2FA or FIDO as second factor is enabled (after DB decrypted and settings loaded)
      const twoFactorAuth = setting.getSetting('security.twoFactorAuth')
      const fidoAsSecondFactor = setting.data.security.fidoAsSecondFactor

      if (fidoAsSecondFactor && fidoDevices.length > 0) {
        // 使用 FIDO 替代 2FA
        // 标记状态并触发 FIDO 认证
        pendingFidoAsSecondFactor = true
        await tryFidoAuth()
        return
      }
      else if (twoFactorAuth?.enabled) {
        show2FAVerification = true
        return
      }

      route.navigate(navigation.visibleItems.at(0)?.route || Routes.ITEMS_ALL)
    }
    catch (err) {
      console.error('Failed to process database:', err)
      notification.error(i18n.t('messages.loadDatabaseFileFailed'))
    }
    finally {
      isLoading = false
    }
  }

  function handle2FAVerified() {
    show2FAVerification = false
    route.navigate(navigation.visibleItems.at(0)?.route || Routes.ITEMS_ALL)
  }

  function resetState() {
    selectedFilePath = null
    isNewDatabase = false
    isRecoverable = false
    password = ''
    confirmPassword = ''
    showPasswordInput = false
    show2FAVerification = false
  }

  const displayFileName = $derived(selectedFilePath ? selectedFilePath.split(/[/\\]/).pop() || '' : '')
</script>

<div class='landing-container'>
  <div class='landing-content'>
    {#if isFidoAuthenticating}
      <!-- FIDO 认证中 -->
      <div class='verify-standalone'>
        <div class='text-center'>
          <div class='loading loading-spinner loading-lg mb-4'></div>
          <p>{i18n.t('fido.authenticating')}</p>
        </div>
      </div>
    {:else if showFidoSelect}
      <!-- FIDO 设备选择 -->
      <div class='verify-standalone'>
        <h3 class='text-lg font-bold mb-4'>{i18n.t('fido.selectDevice')}</h3>
        <div class='space-y-2'>
          {#each fidoDevices as device}
            <button
              class='btn btn-outline w-full justify-start'
              onclick={() => authenticateWithFido(device.id)}
            >
              <Key size={18} />
              {device.name}
            </button>
          {/each}
        </div>
        <div class='divider'></div>
        <button class='btn btn-ghost w-full' onclick={usePasswordInstead}>
          {i18n.t('fido.usePasswordInstead')}
        </button>
      </div>
    {:else if show2FAVerification}
      <div class='verify-standalone'>
        <App2FAVerifyForm onSuccess={handle2FAVerified} />
      </div>
    {:else if !showPasswordInput}
      <!-- Header Section -->
      <div class='landing-header'>
        <div class='app-icon'>
          <FileLock size={32} />
        </div>
        <h1 class='app-title'>{i18n.t('app.title')}</h1>
        <p class='app-subtitle'>{i18n.t('app.slogan')}</p>
      </div>

      <!-- File Selection -->
      <div class='file-section'>
        <WailsFileSelect
          class='file-drop-zone'
          title={i18n.t('landing.dialogTitle')}
          filters={[
            { displayName: i18n.t('landing.passwordFiles'), pattern: '*.pwd' },
            { displayName: i18n.t('landing.allFiles'), pattern: '*.*' },
          ]}
          mode='open'
          multiple={false}
          enableDrop={true}
          dropFilter={paths => paths.filter(path =>
            path.toLowerCase().endsWith('.pwd'),
          )}
          onSelect={handleFilesSelected}
        >
          {#snippet children()}
            <div class='file-drop-content'>
              <FileLock size={24} />
              <p class='file-drop-text'>{i18n.t('landing.selectFileDescription')}</p>
              <span class='file-drop-hint'>{i18n.t('landing.selectFileFormats')}</span>
            </div>
          {/snippet}
        </WailsFileSelect>

        <div class='divider-section'>
          <span class='divider-text'>{i18n.t('common.or')}</span>
        </div>

        <button
          class='btn-new-database'
          onclick={createNewDatabase}
        >
          <Plus size={16} />
          {i18n.t('actions.createNew')}
        </button>
      </div>
    {:else}
      <PasswordForm
        {isNewDatabase}
        {isRecoverable}
        selectedFile={displayFileName}
        bind:password
        bind:confirmPassword
        {isLoading}
        onSubmit={handlePasswordSubmit}
        onReset={resetState}
        onRecover={handleRecoveryOpen}
      />
    {/if}
  </div>
</div>

<LanguageSelector />

<RecoveryCodeModal
  filePath={selectedFilePath!}
  onEnd={handleRecovery}
  isOpen={isRecoveryCodeModalOpen}
  onClose={handleRecoveryClose}
/>

<style>
  .landing-container {
    min-height: 100vh;
    background-color: var(--color-bg-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-lg);
  }

  .landing-content {
    width: 100%;
    max-width: 480px;
  }

  .landing-header {
    text-align: center;
    margin-bottom: var(--space-lg);
  }

  .app-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    background-color: var(--color-primary);
    color: white;
    border-radius: var(--radius-md);
    margin-bottom: var(--space-sm);
  }

  .app-title {
    font-size: var(--font-size-3xl);
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0 0 var(--space-sm) 0;
  }

  .app-subtitle {
    font-size: var(--font-size-base);
    color: var(--color-text-secondary);
    margin: 0;
    letter-spacing: 0.5px;
  }

  .file-section {
    background-color: var(--color-bg-secondary);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-md);
  }

  :global(.file-drop-zone) {
    border: 2px dashed var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-md);
    text-align: center;
    cursor: pointer;
    transition: border-color 0.2s ease;
    background-color: transparent;
  }

  :global(.file-drop-zone:hover) {
    border-color: var(--color-primary);
    background-color: var(--color-bg-tertiary);
  }

  .file-drop-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-sm);
  }

  .file-drop-text {
    font-size: var(--font-size-base);
    color: var(--color-text-primary);
    margin: 0;
  }

  .file-drop-hint {
    font-size: var(--font-size-sm);
    color: var(--color-text-muted);
  }

  .divider-section {
    display: flex;
    align-items: center;
    margin: var(--space-md) 0;
  }

  .divider-section::before,
  .divider-section::after {
    content: '';
    flex: 1;
    height: 1px;
    background-color: var(--color-border);
  }

  .divider-text {
    padding: 0 var(--space-md);
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    background-color: var(--color-bg-secondary);
  }

  .btn-new-database {
    width: 100%;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-sm);
    background-color: var(--color-primary);
    color: white;
    border: none;
    border-radius: var(--radius-md);
    font-size: var(--font-size-base);
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .btn-new-database:hover {
    background-color: var(--color-primary-hover);
  }

  .btn-new-database:active {
    transform: translateY(1px);
  }

  .verify-standalone {
    background-color: var(--color-bg-secondary);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-lg);
  }
</style>
