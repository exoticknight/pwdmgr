<script lang='ts'>
  import Modal from '@/components/modal.svelte'
  import PasswordGenerator from '@/components/password-generator.svelte'
  import PasswordInput from '@/components/password-input.svelte'
  import PasswordNewInput from '@/components/password-new-input.svelte'

  import { app } from '@/stores/app.svelte'
  import { auth } from '@/stores/auth.svelte'
  import { i18n } from '@/stores/i18n.svelte'

  interface Props {
    isOpen: boolean
    onClose: () => void
  }

  const { isOpen, onClose }: Props = $props()

  const form = $state({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  let showPasswordGenerator = $state(false)
  let errorMessage = $state('')

  const isValid = $derived(
    form.oldPassword.trim() && form.newPassword.trim() && form.confirmPassword.trim(),
  )

  const passwordsMatch = $derived.by(() => {
    if (!form.newPassword || !form.confirmPassword) {
      return null
    }
    return form.newPassword === form.confirmPassword
  })

  function resetForm() {
    form.oldPassword = ''
    form.newPassword = ''
    form.confirmPassword = ''
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

  async function handleSubmit() {
    if (!isValid) {
      return
    }

    errorMessage = ''

    try {
      if (!await auth.validatePassword(form.oldPassword)) {
        errorMessage = i18n.t('errors.oldPasswordIncorrect')
        return
      }

      await auth.changePassword(form.oldPassword, form.newPassword)
      app.markSettingAsUnsaved()

      closeModal()
    }
    catch {
      errorMessage = i18n.t('errors.changePasswordFailed')
    }
  }

  function handleFormSubmit(e: Event) {
    e.preventDefault()
    handleSubmit()
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
            <PasswordInput
              bind:value={form.oldPassword}
              showStrength={false}
            />

            <PasswordNewInput
              bind:value={form.newPassword}
              bind:confirmValue={form.confirmPassword}
              enableGenerator={true}
              showStrength={true}
              openGenerator={handleOpenPasswordGenerator}
            />
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
    <button
      type='submit'
      class='btn btn-primary'
      disabled={!isValid || passwordsMatch === false}
      onclick={handleSubmit}
    >
      {i18n.t('actions.ok')}
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
