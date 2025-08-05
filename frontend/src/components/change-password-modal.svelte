<script lang='ts'>
  import { Check, Eye, EyeOff, HelpCircle, WandSparkles, X } from '@lucide/svelte'
  import Modal from '@/components/modal.svelte'
  import PasswordGenerator from '@/components/password-generator.svelte'
  import PasswordStrength from '@/components/password-strength.svelte'
  import { app } from '@/stores/app.svelte'
  import { i18n } from '@/stores/i18n.svelte'
  import { userState } from '@/stores/user.svelte'

  interface Props {
    isOpen: boolean
    onClose: () => void
  }

  const { isOpen, onClose }: Props = $props()

  // Form state
  const form = $state({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  // UI state
  let showOldPassword = $state(false)
  let showPasswordGenerator = $state(false)
  let errorMessage = $state('')

  // Form validation
  const isValid = $derived(
    form.oldPassword.trim() && form.newPassword.trim() && form.confirmPassword.trim(),
  )

  // Password match status
  const passwordsMatch = $derived(() => {
    if (!form.newPassword || !form.confirmPassword) {
      return null
    }
    return form.newPassword === form.confirmPassword
  })

  function resetForm() {
    form.oldPassword = ''
    form.newPassword = ''
    form.confirmPassword = ''
    showOldPassword = false
    showPasswordGenerator = false
    errorMessage = ''
  }

  function closeModal() {
    resetForm()
    onClose()
  }

  function handleOpenPasswordGenerator() {
    showPasswordGenerator = true
  }

  function handleSelectPassword(password: string) {
    form.newPassword = password
    form.confirmPassword = password
    showPasswordGenerator = false
  }

  function handleSubmit() {
    if (!isValid) {
      return
    }

    errorMessage = ''

    // Check if new passwords match
    if (form.newPassword !== form.confirmPassword) {
      errorMessage = i18n.t('errors.passwordMismatch')
      return
    }

    // Check if old password is correct
    if (form.oldPassword !== userState.password) {
      errorMessage = i18n.t('changePassword.oldPasswordIncorrect')
      return
    }

    // Update user password
    userState.password = form.newPassword

    // Mark settings as unsaved using app store
    app.markSettingAsUnsaved()

    // Close modal
    closeModal()
  }

  function handleFormSubmit(e: Event) {
    e.preventDefault()
    handleSubmit()
  }

  function toggleOldPasswordVisibility() {
    showOldPassword = !showOldPassword
  }
</script>

<Modal
  {isOpen}
  title={i18n.t('changePassword.title')}
  onClose={closeModal}
  boxClass='max-w-fit'
>
  {#snippet children()}
    <div class='flex change-password-panel'>
      <div class='flex-1 change-password-panel-left'>
        <form onsubmit={handleFormSubmit}>
          <fieldset class='fieldset w-full'>
            <!-- Old password -->
            <label class='label' for='old-password'>
              {i18n.t('changePassword.oldPassword')} *
            </label>
            <div class='join w-full'>
              <input
                id='old-password'
                type={showOldPassword ? 'text' : 'password'}
                bind:value={form.oldPassword}
                placeholder={i18n.t('changePassword.oldPasswordPlaceholder')}
                class='input join-item flex-1 font-mono'
                required
              />
              <button
                type='button'
                class='btn join-item'
                onclick={toggleOldPasswordVisibility}
                title={showOldPassword ? i18n.t('actions.hidePassword') : i18n.t('actions.showPassword')}
              >
                {#if showOldPassword}
                  <EyeOff size={16} />
                {:else}
                  <Eye size={16} />
                {/if}
              </button>
            </div>

            <!-- New password -->
            <label class='label' for='new-password'>
              {i18n.t('changePassword.newPassword')} *
            </label>
            <div class='join w-full'>
              <input
                id='new-password'
                type='text'
                bind:value={form.newPassword}
                placeholder={i18n.t('changePassword.newPasswordPlaceholder')}
                class='input join-item flex-1 font-mono'
                required
              />
              <button
                type='button'
                class='btn join-item'
                onclick={handleOpenPasswordGenerator}
                title={i18n.t('passwordGenerator.title')}
              >
                <WandSparkles size={16} />
              </button>
            </div>
            {#if form.newPassword}
              <div class='mt-2'>
                <PasswordStrength password={form.newPassword} />
              </div>
            {/if}

            <!-- Confirm new password -->
            <label class='label' for='confirm-password'>
              {i18n.t('changePassword.confirmPassword')} *
            </label>
            <div class='join w-full'>
              <input
                id='confirm-password'
                type='text'
                bind:value={form.confirmPassword}
                placeholder={i18n.t('changePassword.confirmPasswordPlaceholder')}
                class='input join-item flex-1 font-mono'
                required
              />
              <button
                type='button'
                class='btn join-item'
                class:text-white={passwordsMatch() !== null}
                class:btn-success={passwordsMatch()}
                class:btn-error={passwordsMatch() === false}
                title={passwordsMatch() === null ? i18n.t('changePassword.passwordMatchUnknown') : passwordsMatch() ? i18n.t('changePassword.passwordMatch') : i18n.t('changePassword.passwordMismatch')}
              >
                {#if passwordsMatch() === null}
                  <HelpCircle size={16} />
                {:else if passwordsMatch()}
                  <Check size={16} />
                {:else}
                  <X size={16} />
                {/if}
              </button>
            </div>

            <!-- Error message -->
            {#if errorMessage}
              <div class='alert alert-error mt-4'>
                <span>{errorMessage}</span>
              </div>
            {/if}
          </fieldset>
        </form>
      </div>

      <div class='flex-1 change-password-panel-right' class:!hidden={!showPasswordGenerator}>
        <PasswordGenerator onSelect={handleSelectPassword} />
      </div>
    </div>
  {/snippet}

  {#snippet actions()}
    <button type='button' class='btn' onclick={closeModal}>
      {i18n.t('dialogs.cancel')}
    </button>
    <button
      type='submit'
      class='btn btn-primary'
      disabled={!isValid}
      onclick={handleSubmit}
    >
      {i18n.t('dialogs.ok')}
    </button>
  {/snippet}
</Modal>

<style>
  .change-password-panel {
    --panel-width: 25rem;
    display: flex;
    gap: 1rem;
  }

  .change-password-panel-left {
    width: var(--panel-width);
  }

  .change-password-panel-right {
    width: var(--panel-width);
  }
</style>
