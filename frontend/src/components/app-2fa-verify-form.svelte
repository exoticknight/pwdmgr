<script lang='ts'>
  import { KeyRound, ShieldCheck } from '@lucide/svelte'
  import { getLockoutRemainingSeconds } from '@/services/app-2fa'
  import { app2FA } from '@/stores/app-2fa.svelte'
  import { i18n } from '@/stores/i18n.svelte'

  interface Props {
    onSuccess: () => void
    provider?: {
      verify: (code: string) => Promise<boolean>
      verifyBackup: (code: string) => Promise<boolean>
    }
  }

  const { onSuccess, provider }: Props = $props()
  const providerImpl = $derived(provider ?? app2FA)

  let code = $state('')
  let error = $state('')
  let isBackupMode = $state(false)
  let isVerifying = $state(false)
  let lockoutCountdown = $state(0)
  let lockoutTimer = $state<number | null>(null)

  $effect(() => {
    if (app2FA.isLocked) {
      startLockoutTimer()
    }
    return () => {
      if (lockoutTimer !== null) {
        clearInterval(lockoutTimer)
      }
    }
  })

  function startLockoutTimer() {
    lockoutCountdown = getLockoutRemainingSeconds(app2FA.lockedUntil)
    if (lockoutTimer !== null) {
      clearInterval(lockoutTimer)
    }
    lockoutTimer = window.setInterval(() => {
      lockoutCountdown = getLockoutRemainingSeconds(app2FA.lockedUntil)
      if (lockoutCountdown <= 0 && lockoutTimer !== null) {
        clearInterval(lockoutTimer)
        lockoutTimer = null
      }
    }, 1000)
  }

  async function handleSubmit(event: Event) {
    event.preventDefault()
    if (!code.trim()) {
      return
    }

    isVerifying = true
    error = ''

    try {
      let success: boolean
      if (isBackupMode) {
        success = await providerImpl.verifyBackup(code.trim())
      }
      else {
        success = await providerImpl.verify(code.trim())
      }

      if (success) {
        code = ''
        error = ''
        onSuccess()
      }
      else {
        code = ''
        if (app2FA.isLocked) {
          startLockoutTimer()
          error = i18n.t('app2fa.verify.locked')
        }
        else {
          error = isBackupMode
            ? i18n.t('app2fa.verify.invalidBackupCode')
            : i18n.t('app2fa.verify.invalidCode')
        }
      }
    }
    finally {
      isVerifying = false
    }
  }

  function toggleMode() {
    isBackupMode = !isBackupMode
    code = ''
    error = ''
  }

  function clearError() {
    error = ''
  }
</script>

<div class='verify-form-container'>
  <div class='verify-header'>
    <div class='verify-icon'>
      {#if isBackupMode}
        <KeyRound size={24} />
      {:else}
        <ShieldCheck size={24} />
      {/if}
    </div>
    <h3 class='verify-title'>
      {isBackupMode ? i18n.t('app2fa.verify.backupTitle') : i18n.t('app2fa.verify.title')}
    </h3>
    <p class='verify-subtitle'>
      {isBackupMode ? i18n.t('app2fa.verify.backupDescription') : i18n.t('app2fa.verify.description')}
    </p>
  </div>

  <form onsubmit={handleSubmit} class='verify-form'>
    {#if app2FA.isLocked && lockoutCountdown > 0}
      <div class='lockout-warning'>
        <p>{i18n.t('app2fa.verify.lockedMessage', { seconds: lockoutCountdown })}</p>
      </div>
    {:else}
      <div class='form-control'>
        <input
          id='2fa-code-input'
          type='text'
          class='input w-full text-center tracking-widest'
          class:input-error={error}
          placeholder={isBackupMode ? i18n.t('app2fa.verify.backupPlaceholder') : i18n.t('app2fa.verify.placeholder')}
          bind:value={code}
          oninput={clearError}
          maxlength={isBackupMode ? 9 : 6}
          autocomplete='one-time-code'
          inputmode={isBackupMode ? 'text' : 'numeric'}
        />
        {#if error}
          <label class='label' for='2fa-code-input'>
            <span class='label-text-alt text-error'>{error}</span>
          </label>
        {/if}
        {#if !isBackupMode && app2FA.failedAttempts > 0 && !app2FA.isLocked}
          <label class='label' for='2fa-code-input'>
            <span class='label-text-alt text-warning'>
              {i18n.t('app2fa.verify.attemptsRemaining', { count: 5 - app2FA.failedAttempts })}
            </span>
          </label>
        {/if}
      </div>

      <button
        type='submit'
        class='btn btn-primary w-full'
        disabled={!code.trim() || isVerifying}
      >
        {#if isVerifying}
          <span class='loading loading-spinner loading-sm'></span>
        {/if}
        {i18n.t('app2fa.verify.verifyButton')}
      </button>
    {/if}

    <button
      type='button'
      class='btn btn-ghost btn-sm w-full'
      onclick={toggleMode}
    >
      {isBackupMode ? i18n.t('app2fa.verify.useAuthenticator') : i18n.t('app2fa.verify.useBackupCode')}
    </button>
  </form>
</div>

<style>
  .verify-form-container {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .verify-header {
    text-align: center;
  }

  .verify-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background-color: var(--color-primary);
    color: white;
    border-radius: var(--radius-md);
    margin-bottom: var(--space-sm);
  }

  .verify-title {
    font-size: var(--font-size-lg);
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0 0 var(--space-xs) 0;
  }

  .verify-subtitle {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    margin: 0;
  }

  .verify-form {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .lockout-warning {
    text-align: center;
    padding: var(--space-md);
    background-color: var(--color-error-bg, oklch(0.95 0.03 25));
    border-radius: var(--radius-md);
    color: var(--color-error);
    font-size: var(--font-size-sm);
  }

  .lockout-warning p {
    margin: 0;
  }
</style>
