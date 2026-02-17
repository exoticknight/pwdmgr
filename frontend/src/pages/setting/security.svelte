<script lang='ts'>
  import { app2FA } from '@/stores/app-2fa.svelte'
  import { auth } from '@/stores/auth.svelte'
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

  function handleAutoLockChange(event: Event, markUnsaved: () => void) {
    const checkbox = event.target as HTMLInputElement

    setting.updateSetting('security.autoLock', checkbox.checked)
    markUnsaved()
  }

  function handleAutoLockTimeChange(event: Event, markUnsaved: () => void) {
    const select = event.target as HTMLSelectElement
    const selectedTime = Number(select.value)

    setting.updateSetting('security.autoLockTime', selectedTime)
    markUnsaved()
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
    notification.success(i18n.t('app2fa.setup.enabledSuccess'))
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
    notification.success(i18n.t('app2fa.setup.disabledSuccess'))
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
          {#if auth.isRecoveryEnabled}
            {i18n.t('setting.security.recoveryCodeEnabledButtonText')}
          {:else}
            {i18n.t('setting.security.recoveryCodeButtonText')}
          {/if}
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
            {i18n.t('setting.security.twoFactorAuthDisableButton')}
          </button>
        {:else}
          <button
            type='button'
            class='btn btn-outline'
            onclick={open2FASetup}
          >
            {i18n.t('setting.security.twoFactorAuthEnableButton')}
          </button>
        {/if}
      {/snippet}
    </SettingItem>
  {/snippet}
</SettingSection>

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
