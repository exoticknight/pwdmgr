<script lang='ts'>
  import { generateRegistrationOptions, isSupported as isFidoSupported, register } from '@/services/fido'
  import { app2FA } from '@/stores/app-2fa.svelte'
  import { app } from '@/stores/app.svelte'
  import { auth } from '@/stores/auth.svelte'
  import { database } from '@/stores/database.svelte'
  import { i18n } from '@/stores/i18n.svelte'
  import { notification } from '@/stores/notification.svelte'

  import { setting } from '@/stores/setting.svelte'
  import { twoFAGate } from '@/stores/twofa-gate.svelte'
  import App2FADisable from './app-2fa-disable.svelte'
  import App2FASetup from './app-2fa-setup.svelte'
  import ChangePasswordModal from './change-password-modal.svelte'
  import ChangeRecoveryModal from './change-recovery-modal.svelte'
  import SettingItem from './setting-item.svelte'
  import SettingSection from './setting-section.svelte'

  // FIDO 状态
  const fidoSupported = isFidoSupported()
  let showPasswordModal = $state(false)
  let pendingCredential = $state<{ credentialId: string, publicKey: string, deviceName: string } | null>(null)
  let passwordForFido = $state('')
  let isRegistering = $state(false)

  // 设备列表验证状态
  let showDevicesListVerified = $state(false)

  function closePasswordModal() {
    showPasswordModal = false
    pendingCredential = null
    passwordForFido = ''
  }

  // 验证通过后显示设备列表
  async function verifyAndShowDevices() {
    const fidoDevices = auth.fidoDevicesList
    if (fidoDevices.length === 0) {
      showDevicesListVerified = true
      return
    }

    // 使用twofa gate进行验证
    const ok = await twoFAGate.verify()
    if (ok) {
      showDevicesListVerified = true
    }
  }

  // 直接调起 WebAuthn 注册
  async function startAddDevice(_markUnsaved: () => void) {
    isRegistering = true
    try {
      // 直接调用 WebAuthn 注册（系统会弹出 Passkey 注册界面）
      const deviceName = `${i18n.t('setting.security.fidoDeviceName')} ${(auth.fidoDevicesList.length + 1)}`
      const options = generateRegistrationOptions('bei3mat6', 'default-user', deviceName)
      const response = await register(options)

      // 检查注册是否成功
      if (!response?.id || !response?.response?.publicKey) {
        console.warn('Registration was cancelled or failed:', response)
        notification.error(i18n.t('setting.security.fidoRegistrationCancelled'))
        return
      }

      // 注册成功，保存待处理的凭证信息
      // simplewebauthn 返回的格式: response.id 是 base64url 编码的字符串
      pendingCredential = {
        credentialId: response.id,
        publicKey: JSON.stringify(response.response.publicKey),
        deviceName,
      }

      // 弹出密码输入框
      showPasswordModal = true
    }
    catch (error) {
      console.error('Failed to register device:', error)
      notification.error(i18n.t('setting.security.fidoRegisterFailed'))
    }
    finally {
      isRegistering = false
    }
  }

  // 输入密码后完成添加设备
  async function confirmAddDevice(_markUnsaved: () => void) {
    if (!passwordForFido || !pendingCredential) {
      notification.error(i18n.t('setting.security.fidoPasswordRequired'))
      return
    }

    try {
      // 保存设备到 KeyData
      await auth.addFidoDevice(
        pendingCredential.credentialId,
        pendingCredential.publicKey,
        pendingCredential.deviceName,
        passwordForFido,
      )

      // 自动保存数据库
      await database.saveToFile(app.dbPath)

      closePasswordModal()
      notification.success(i18n.t('setting.security.fidoDeviceAdded'))
    }
    catch (error) {
      console.error('Failed to save device:', error)
      notification.error(i18n.t('setting.security.fidoDeviceSaveFailed'))
    }
  }

  function handleAutoLockChange(event: Event, _markUnsaved: () => void) {
    const checkbox = event.target as HTMLInputElement

    setting.updateSetting('security.autoLock', checkbox.checked)
    // 自动保存
    void database.saveToFile(app.dbPath)
  }

  function handleAutoLockTimeChange(event: Event, _markUnsaved: () => void) {
    const select = event.target as HTMLSelectElement
    const selectedTime = Number(select.value)

    setting.updateSetting('security.autoLockTime', selectedTime)
    // 自动保存
    void database.saveToFile(app.dbPath)
  }

  // FIDO 开关处理 - 关闭时需要验证，开启不需要
  async function handleFidoEnabledToggle(_markUnsaved: () => void) {
    const currentValue = setting.data.security.fidoEnabled
    const newValue = !currentValue // 切换状态

    // 关闭FIDO需要验证
    if (!newValue) {
      const ok = await twoFAGate.verify()
      if (!ok) {
        return // 验证失败，不更新状态，UI保持原状
      }
    }

    // 更新设置
    setting.updateSetting('security.fidoEnabled', newValue)
    // 自动保存
    void database.saveToFile(app.dbPath)
  }

  async function handleFidoAsPrimaryToggle(_markUnsaved: () => void) {
    const currentValue = setting.data.security.fidoAsPrimary
    const newValue = !currentValue

    // 关闭需要验证
    if (!newValue) {
      const ok = await twoFAGate.verify()
      if (!ok) {
        return
      }
    }

    setting.updateSetting('security.fidoAsPrimary', newValue)
    // 自动保存
    void database.saveToFile(app.dbPath)
  }

  async function handleFidoAsSecondFactorToggle(_markUnsaved: () => void) {
    const currentValue = setting.data.security.fidoAsSecondFactor
    const newValue = !currentValue

    // 关闭需要验证
    if (!newValue) {
      const ok = await twoFAGate.verify()
      if (!ok) {
        return
      }
    }

    setting.updateSetting('security.fidoAsSecondFactor', newValue)
    // 自动保存
    void database.saveToFile(app.dbPath)
  }

  // 删除设备
  async function handleRemoveDevice(deviceId: string, _markUnsaved: () => void) {
    try {
      await auth.removeFidoDevice(deviceId)
      // 自动保存
      await database.saveToFile(app.dbPath)
      notification.success(i18n.t('setting.security.fidoDeviceRemoved'))
    }
    catch (error) {
      console.error('Failed to remove device:', error)
      notification.error(i18n.t('setting.security.fidoDeviceRemoveFailed'))
    }
  }

  let showChangePasswordModal = $state(false)

  async function openChangePasswordModal() {
    if (app2FA.enabled) {
      const ok = await twoFAGate.verify()
      if (!ok)
        return
    }
    showChangePasswordModal = true
  }

  function closeChangePasswordModal() {
    showChangePasswordModal = false
  }

  let showRecoveryCodeModal = $state(false)
  async function handleRecoveryCodeOpen() {
    if (app2FA.enabled) {
      const ok = await twoFAGate.verify()
      if (!ok)
        return
    }
    showRecoveryCodeModal = true
  }
  function closeRecoveryCodeModal() {
    showRecoveryCodeModal = false
  }

  let show2FASetupModal = $state(false)
  function open2FASetup() {
    show2FASetupModal = true
  }
  function close2FASetup() {
    show2FASetupModal = false
  }
  function handle2FAComplete() {
    show2FASetupModal = false
    notification.success(i18n.t('app2fa.setup.turnedOnSuccess'))
  }

  let show2FADisableModal = $state(false)
  function open2FADisable() {
    show2FADisableModal = true
  }
  function close2FADisable() {
    show2FADisableModal = false
  }
  function handle2FADisabled() {
    show2FADisableModal = false
    notification.success(i18n.t('app2fa.setup.turnedOffSuccess'))
  }
</script>

<SettingSection title={i18n.t('setting.security.title')}>
  {#snippet items(markUnsaved: () => void)}
    <SettingItem
      title={i18n.t('setting.security.autoLock')}
      description={i18n.t('setting.security.autoLockDescription')}
    >
      {#snippet control()}
        <input
          id='auto-lock-toggle'
          type='checkbox'
          class='toggle'
          checked={setting.data.security.autoLock}
          onchange={e => handleAutoLockChange(e, markUnsaved)}
        />
      {/snippet}
    </SettingItem>

    <SettingItem
      title={i18n.t('setting.security.autoLockTime')}
      description={i18n.t('setting.security.autoLockTimeDescription')}
      disabled={!setting.data.security.autoLock}
    >
      {#snippet control()}
        <select
          id='auto-lock-time-select'
          class='select max-w-fit'
          value={setting.data.security.autoLockTime}
          onchange={e => handleAutoLockTimeChange(e, markUnsaved)}
          disabled={!setting.data.security.autoLock}
        >
          <option value={1}>1 {i18n.t('setting.time.minute')}</option>
          <option value={5}>5 {i18n.t('setting.time.minutes')}</option>
          <option value={10}>10 {i18n.t('setting.time.minutes')}</option>
        </select>
      {/snippet}
    </SettingItem>

    <SettingItem
      title={i18n.t('setting.security.changePassword')}
      description={i18n.t('setting.security.changePasswordDescription')}
    >
      {#snippet control()}
        <button
          type='button'
          class='btn btn-outline'
          onclick={openChangePasswordModal}
        >
          {i18n.t('setting.security.changePassword')}
        </button>
      {/snippet}
    </SettingItem>

    <SettingItem
      title={i18n.t('setting.security.recoveryCode')}
      description={i18n.t('setting.security.recoveryCodeDescription')}
    >
      {#snippet control()}
        <button
          type='button'
          class='btn btn-outline'
          class:btn-error={auth.isRecoveryEnabled}
          onclick={handleRecoveryCodeOpen}
        >
          {auth.isRecoveryEnabled ? i18n.t('common.off') : i18n.t('common.on')}
        </button>
      {/snippet}
    </SettingItem>

    <SettingItem
      title={i18n.t('setting.security.twoFactorAuth')}
      description={i18n.t('setting.security.twoFactorAuthDescription')}
    >
      {#snippet control()}
        {#if app2FA.enabled}
          <button
            type='button'
            class='btn btn-outline btn-error'
            onclick={open2FADisable}
          >
            {i18n.t('common.off')}
          </button>
        {:else}
          <button
            type='button'
            class='btn btn-outline'
            onclick={open2FASetup}
          >
            {i18n.t('common.on')}
          </button>
        {/if}
      {/snippet}
    </SettingItem>
  {/snippet}
</SettingSection>

<!-- FIDO / Passkey 设置 -->
{#if fidoSupported}
  <SettingSection title={i18n.t('setting.security.fidoTitle')}>
    {#snippet items(markUnsaved: () => void)}
      <SettingItem
        title={i18n.t('setting.security.fidoEnabled')}
        description={i18n.t('setting.security.fidoEnabledDescription')}
      >
        {#snippet control()}
          <button
            type='button'
            class='btn btn-outline'
            class:btn-error={setting.data.security.fidoEnabled}
            onclick={() => handleFidoEnabledToggle(markUnsaved)}
          >
            {setting.data.security.fidoEnabled ? i18n.t('common.off') : i18n.t('common.on')}
          </button>
        {/snippet}
      </SettingItem>

      {#if setting.data.security.fidoEnabled}
        <SettingItem
          title={i18n.t('setting.security.fidoAsPrimary')}
          description={i18n.t('setting.security.fidoAsPrimaryDescription')}
        >
          {#snippet control()}
            <button
              type='button'
              class='btn btn-outline'
              class:btn-error={setting.data.security.fidoAsPrimary}
              onclick={() => handleFidoAsPrimaryToggle(markUnsaved)}
            >
              {setting.data.security.fidoAsPrimary ? i18n.t('common.off') : i18n.t('common.on')}
            </button>
          {/snippet}
        </SettingItem>

        <SettingItem
          title={i18n.t('setting.security.fidoAsSecondFactor')}
          description={i18n.t('setting.security.fidoAsSecondFactorDescription')}
        >
          {#snippet control()}
            <button
              type='button'
              class='btn btn-outline'
              class:btn-error={setting.data.security.fidoAsSecondFactor}
              onclick={() => handleFidoAsSecondFactorToggle(markUnsaved)}
            >
              {setting.data.security.fidoAsSecondFactor ? i18n.t('common.off') : i18n.t('common.on')}
            </button>
          {/snippet}
        </SettingItem>

        <!-- 已注册的设备列表 -->
        <div class='fido-devices'>
          {#if showDevicesListVerified}
            <!-- 验证通过后显示设备列表 -->
            <div class='fido-devices-header'>
              {i18n.t('setting.security.fidoDevices')}
            </div>
            {#if auth.fidoDevicesList.length === 0}
              <p class='fido-devices-empty'>
                {i18n.t('setting.security.fidoDevicesEmpty')}
              </p>
            {:else}
              {#each auth.fidoDevicesList as device}
                <div class='fido-device-item'>
                  <span class='fido-device-name'>{device.name}</span>
                  <button
                    type='button'
                    class='btn btn-outline btn-sm btn-error'
                    onclick={() => handleRemoveDevice(device.id, markUnsaved)}
                  >
                    {i18n.t('common.delete')}
                  </button>
                </div>
              {/each}
            {/if}
            <button
              type='button'
              class='btn btn-outline btn-sm mt-2'
              onclick={() => startAddDevice(() => {})}
            >
              {#if isRegistering}
                <span class='loading loading-spinner loading-sm'></span>
              {/if}
              {i18n.t('setting.security.fidoAddDevice')}
            </button>
          {:else}
            <!-- 未验证时显示查看按钮 -->
            <button
              type='button'
              class='btn btn-outline btn-sm'
              onclick={() => verifyAndShowDevices()}
            >
              {i18n.t('setting.security.fidoShowDevices')}
            </button>
            <p class='text-xs text-base-content/50 mt-1'>
              {i18n.t('setting.security.fidoVerifyToShow')}
            </p>
          {/if}
        </div>
      {/if}
    {/snippet}
  </SettingSection>
{/if}

<!-- 输入密码 Modal（WebAuthn 注册后） -->
{#if showPasswordModal}
  <div class='modal modal-open'>
    <div class='modal-box'>
      <h3 class='font-bold text-lg'>
        {i18n.t('setting.security.fidoEnterPassword')}
      </h3>
      <p class='text-sm text-base-content/70 mb-4'>
        {i18n.t('setting.security.fidoEnterPasswordDesc')}
      </p>
      <div class='py-4'>
        <input
          type='password'
          placeholder={i18n.t('password.placeholder')}
          class='input input-bordered w-full'
          bind:value={passwordForFido}
        />
      </div>
      <div class='modal-action'>
        <button class='btn' onclick={closePasswordModal}>
          {i18n.t('common.cancel')}
        </button>
        <button
          class='btn btn-primary'
          disabled={!passwordForFido}
          onclick={() => confirmAddDevice(() => {})}
        >
          {i18n.t('common.confirm')}
        </button>
      </div>
    </div>
  </div>
{/if}

<ChangePasswordModal
  isOpen={showChangePasswordModal}
  onClose={closeChangePasswordModal}
/>

<ChangeRecoveryModal
  isOpen={showRecoveryCodeModal}
  onClose={closeRecoveryCodeModal}
/>

<App2FASetup
  isOpen={show2FASetupModal}
  onClose={close2FASetup}
  onComplete={handle2FAComplete}
/>

<App2FADisable
  isOpen={show2FADisableModal}
  onClose={close2FADisable}
  onComplete={handle2FADisabled}
/>
