<script lang='ts'>
  import { auth } from '@/stores/auth.svelte'
  import { i18n } from '@/stores/i18n.svelte'
  import { setting } from '@/stores/setting.svelte'

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
  function openChangePasswordModal() {
    showChangePasswordModal = true
  }
  function closeChangePasswordModal() {
    showChangePasswordModal = false
  }

  let showRecoveryCodeModal = $state(false)
  function handleRecoveryCodeOpen() {
    showRecoveryCodeModal = true
  }
  function closeRecoveryCodeModal() {
    showRecoveryCodeModal = false
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
          <option value={5}>5 {i18n.t('setting.time.minutes')}</option>
          <option value={10}>10 {i18n.t('setting.time.minutes')}</option>
          <option value={15}>15 {i18n.t('setting.time.minutes')}</option>
          <option value={30}>30 {i18n.t('setting.time.minutes')}</option>
          <option value={60}>1 {i18n.t('setting.time.hour')}</option>
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
