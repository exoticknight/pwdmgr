<script lang='ts'>
  import Modal from '@/components/modal.svelte'
  import { app2FA } from '@/stores/app-2fa.svelte'
  import { app } from '@/stores/app.svelte'
  import { auth } from '@/stores/auth.svelte'
  import { database } from '@/stores/database.svelte'
  import { i18n } from '@/stores/i18n.svelte'
  import { userState } from '@/stores/user.svelte'

  interface Props {
    isOpen: boolean
    onClose: () => void
    onComplete: () => void
  }

  const { isOpen, onClose, onComplete }: Props = $props()

  type DisableStep = 'password' | 'totp'

  let step = $state<DisableStep>('password')
  let password = $state('')
  let totpCode = $state('')
  let errorMessage = $state('')
  let isSubmitting = $state(false)

  function resetForm() {
    step = 'password'
    password = ''
    totpCode = ''
    errorMessage = ''
    isSubmitting = false
  }

  function closeModal() {
    resetForm()
    onClose()
  }

  async function handlePasswordStep() {
    if (!password.trim()) {
      return
    }

    isSubmitting = true
    errorMessage = ''

    try {
      const valid = await auth.validatePassword(password.trim())
      if (!valid) {
        errorMessage = i18n.t('app2fa.disable.wrongPassword')
        return
      }

      step = 'totp'
    }
    catch {
      errorMessage = i18n.t('app2fa.disable.failed')
    }
    finally {
      isSubmitting = false
    }
  }

  async function handleTotpStep() {
    if (!totpCode.trim()) {
      return
    }

    isSubmitting = true
    errorMessage = ''

    try {
      const valid = app2FA.verify(totpCode.trim())
      if (!valid) {
        errorMessage = i18n.t('app2fa.disable.wrongCode')
        totpCode = ''
        isSubmitting = false
        return
      }

      // Disable and persist immediately
      app2FA.disable()
      database.commitSetting()
      await database.saveToFile(userState.dbPath)
      app.markSettingAsSaved()

      resetForm()
      onComplete()
    }
    catch {
      errorMessage = i18n.t('app2fa.disable.failed')
      isSubmitting = false
    }
  }

  function handleFormSubmit(e: Event) {
    e.preventDefault()
    if (step === 'password') {
      handlePasswordStep()
    }
    else {
      handleTotpStep()
    }
  }
</script>

<Modal
  {isOpen}
  title={i18n.t('app2fa.disable.title')}
  onClose={closeModal}
>
  {#snippet children()}
    <form onsubmit={handleFormSubmit} class='space-y-4'>
      <p class='text-sm text-base-content/70'>
        {i18n.t('app2fa.disable.description')}
      </p>

      {#if step === 'password'}
        <div class='form-control'>
          <label class='label' for='disable-2fa-password'>
            <span class='label-text'>{i18n.t('password.label')}</span>
          </label>
          <input
            id='disable-2fa-password'
            type='password'
            class='input input-bordered w-full'
            class:input-error={errorMessage}
            placeholder={i18n.t('password.placeholder')}
            bind:value={password}
            oninput={() => { errorMessage = '' }}
          />
        </div>
      {:else}
        <div class='form-control'>
          <label class='label' for='disable-2fa-code'>
            <span class='label-text'>{i18n.t('app2fa.verify.title')}</span>
          </label>
          <input
            id='disable-2fa-code'
            type='text'
            class='input input-bordered w-full text-center tracking-widest'
            class:input-error={errorMessage}
            placeholder={i18n.t('app2fa.verify.placeholder')}
            bind:value={totpCode}
            oninput={() => { errorMessage = '' }}
            maxlength={6}
            inputmode='numeric'
            autocomplete='one-time-code'
          />
        </div>
      {/if}

      {#if errorMessage}
        <div class='alert alert-error'>
          <span>{errorMessage}</span>
        </div>
      {/if}
    </form>
  {/snippet}

  {#snippet actions()}
    <button
      class='btn btn-ghost'
      onclick={closeModal}
    >
      {i18n.t('actions.cancel')}
    </button>
    {#if step === 'password'}
      <button
        class='btn btn-primary'
        disabled={!password.trim() || isSubmitting}
        onclick={handlePasswordStep}
      >
        {#if isSubmitting}
          <span class='loading loading-spinner loading-sm'></span>
        {/if}
        {i18n.t('app2fa.setup.nextButton')}
      </button>
    {:else}
      <button
        class='btn btn-error'
        disabled={!totpCode.trim() || totpCode.trim().length !== 6 || isSubmitting}
        onclick={handleTotpStep}
      >
        {#if isSubmitting}
          <span class='loading loading-spinner loading-sm'></span>
        {/if}
        {i18n.t('app2fa.disable.confirmButton')}
      </button>
    {/if}
  {/snippet}
</Modal>
