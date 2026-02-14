<script lang='ts'>
  import { KeyRound, ShieldCheck } from '@lucide/svelte'
  import { getLockoutRemainingSeconds } from '@/services/app-2fa'
  import { app2FA } from '@/stores/app-2fa.svelte'
  import { app } from '@/stores/app.svelte'
  import { database } from '@/stores/database.svelte'
  import { i18n } from '@/stores/i18n.svelte'
  import { userState } from '@/stores/user.svelte'

  interface Props {
    onSuccess: () => void
  }

  const { onSuccess }: Props = $props()

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
        success = await app2FA.verifyBackup(code.trim())
      }
      else {
        success = app2FA.verify(code.trim())
      }

      if (success) {
        // Persist consumed backup code to disk so it can't be reused
        if (isBackupMode) {
          try {
            database.commitSetting()
            await database.saveToFile(userState.dbPath)
            app.markSettingAsSaved()
          }
          catch (err) {
            console.error('Failed to persist backup code consumption:', err)
          }
        }

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

<div class='verify-container'>
  <div class='verify-card'>
    <div class='verify-header'>
      <div class='verify-icon'>
        {#if isBackupMode}
          <KeyRound size={28} />
        {:else}
          <ShieldCheck size={28} />
        {/if}
      </div>
      <h2 class='verify-title'>
        {isBackupMode ? i18n.t('app2fa.verify.backupTitle') : i18n.t('app2fa.verify.title')}
      </h2>
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
</div>

<style>
  .verify-container {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .verify-card {
    width: 100%;
    max-width: 400px;
    background-color: var(--color-bg-secondary);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-lg);
  }

  .verify-header {
    text-align: center;
    margin-bottom: var(--space-lg);
  }

  .verify-icon {
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

  .verify-title {
    font-size: var(--font-size-xl);
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0 0 var(--space-sm) 0;
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
