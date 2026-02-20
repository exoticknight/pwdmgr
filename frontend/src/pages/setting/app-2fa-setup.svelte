<script lang='ts'>
  import { ArrowLeft, ArrowRight, Check, Copy, KeyRound, Smartphone } from '@lucide/svelte'
  import Modal from '@/components/modal.svelte'
  import QRCodeDisplay from '@/components/qr-code-display.svelte'
  import { app2FA } from '@/stores/app-2fa.svelte'
  import { app } from '@/stores/app.svelte'
  import { database } from '@/stores/database.svelte'
  import { i18n } from '@/stores/i18n.svelte'
  import { notification } from '@/stores/notification.svelte'

  interface Props {
    isOpen: boolean
    onClose: () => void
    onComplete: () => void
  }

  const { isOpen, onClose, onComplete }: Props = $props()

  type SetupStep = 'intro' | 'scan' | 'verify' | 'backup'

  let step = $state<SetupStep>('intro')
  let verificationCode = $state('')
  let verifyError = $state('')
  let isVerifying = $state(false)
  let copiedBackupCodes = $state(false)
  let showSecret = $state(false)

  function startSetup() {
    app2FA.startSetup()
    step = 'scan'
  }

  async function handleVerify() {
    if (!verificationCode.trim()) {
      return
    }

    isVerifying = true
    verifyError = ''

    try {
      const success = await app2FA.completeSetup(verificationCode.trim())
      if (success) {
        // Persist to file immediately
        database.commitSetting()
        await database.saveToFile(app.dbPath)
        app.markSettingAsSaved()
        step = 'backup'
      }
      else {
        verifyError = i18n.t('app2fa.setup.verifyError')
        verificationCode = ''
      }
    }
    catch (err) {
      console.error('Failed to save 2FA config:', err)
      verifyError = i18n.t('app2fa.setup.verifyError')
      verificationCode = ''
    }
    finally {
      isVerifying = false
    }
  }

  async function copyBackupCodes() {
    const codes = app2FA.pendingSetup?.backupCodes
    if (!codes) {
      return
    }

    try {
      await navigator.clipboard.writeText(codes.join('\n'))
      copiedBackupCodes = true
      notification.success(i18n.t('notifications.copied'))
      setTimeout(() => {
        copiedBackupCodes = false
      }, 2000)
    }
    catch {
      notification.error(i18n.t('notifications.copyFailed'))
    }
  }

  async function copySecret() {
    const secret = app2FA.pendingSetup?.secret
    if (!secret) {
      return
    }

    try {
      await navigator.clipboard.writeText(secret)
      notification.success(i18n.t('notifications.copied'))
    }
    catch {
      notification.error(i18n.t('notifications.copyFailed'))
    }
  }

  function handleComplete() {
    app2FA.finalizeSetup()
    step = 'intro'
    verificationCode = ''
    verifyError = ''
    copiedBackupCodes = false
    showSecret = false
    onComplete()
  }

  function handleCancel() {
    app2FA.cancelSetup()
    step = 'intro'
    verificationCode = ''
    verifyError = ''
    copiedBackupCodes = false
    showSecret = false
    onClose()
  }
</script>

<Modal
  {isOpen}
  title={i18n.t('app2fa.setup.title')}
  onClose={handleCancel}
  boxClass='max-w-lg'
>
  {#snippet children()}
    <!-- Steps indicator -->
    <div class='steps-indicator'>
      {#each ['intro', 'scan', 'verify', 'backup'] as s, idx}
        <div
          class='step-dot'
          class:active={['intro', 'scan', 'verify', 'backup'].indexOf(step) >= idx}
          class:current={step === s}
        ></div>
      {/each}
    </div>

    <!-- Content -->
    {#if step === 'intro'}
      <div class='step-content'>
        <p class='step-description'>{i18n.t('app2fa.setup.introDescription')}</p>
        <div class='checklist'>
          <div class='checklist-item'>
            <div class='checklist-icon'>
              <Smartphone size={16} />
            </div>
            <span>{i18n.t('app2fa.setup.requirement1')}</span>
          </div>
          <div class='checklist-item'>
            <div class='checklist-icon'>
              <KeyRound size={16} />
            </div>
            <span>{i18n.t('app2fa.setup.requirement2')}</span>
          </div>
        </div>
      </div>

    {:else if step === 'scan'}
      <div class='step-content'>
        <p class='step-description'>{i18n.t('app2fa.setup.scanDescription')}</p>

        {#if app2FA.pendingSetup}
          <div class='qr-container'>
            <QRCodeDisplay value={app2FA.pendingSetup.qrUri} size={200} />
          </div>

          <div class='secret-section'>
            <button
              class='btn btn-ghost btn-sm'
              onclick={() => { showSecret = !showSecret }}
            >
              {showSecret ? i18n.t('app2fa.setup.hideSecret') : i18n.t('app2fa.setup.showSecret')}
            </button>

            {#if showSecret}
              <div class='secret-display'>
                <code>{app2FA.pendingSetup.secret}</code>
                <button class='btn btn-ghost btn-xs btn-square' onclick={copySecret}>
                  <Copy size={14} />
                </button>
              </div>
            {/if}
          </div>
        {/if}
      </div>

    {:else if step === 'verify'}
      <div class='step-content'>
        <p class='step-description'>{i18n.t('app2fa.setup.verifyDescription')}</p>

        <div class='verify-input-group'>
          <input
            id='setup-verify-code'
            type='text'
            class='input w-full text-center tracking-widest'
            class:input-error={verifyError}
            placeholder={i18n.t('app2fa.verify.placeholder')}
            bind:value={verificationCode}
            oninput={() => { verifyError = '' }}
            maxlength={6}
            inputmode='numeric'
            autocomplete='one-time-code'
          />
          {#if verifyError}
            <span class='text-error text-sm'>{verifyError}</span>
          {/if}
        </div>
      </div>

    {:else if step === 'backup'}
      <div class='step-content'>
        <p class='step-description'>{i18n.t('app2fa.setup.backupDescription')}</p>

        {#if app2FA.pendingSetup}
          <div class='backup-codes-grid'>
            {#each app2FA.pendingSetup.backupCodes as backupCode, idx}
              <div class='backup-code'>
                <span class='backup-code-index'>{idx + 1}.</span>
                <code>{backupCode}</code>
              </div>
            {/each}
          </div>

          <button class='btn btn-outline btn-sm w-full' onclick={copyBackupCodes}>
            {#if copiedBackupCodes}
              <Check size={14} />
              {i18n.t('app2fa.setup.copied')}
            {:else}
              <Copy size={14} />
              {i18n.t('app2fa.setup.copyBackupCodes')}
            {/if}
          </button>
        {/if}

        <div class='backup-warning'>
          <p>{i18n.t('app2fa.setup.backupWarning')}</p>
        </div>
      </div>
    {/if}
  {/snippet}

  {#snippet actions()}
    {#if step === 'intro'}
      <button class='btn btn-ghost' onclick={handleCancel}>
        {i18n.t('actions.cancel')}
      </button>
      <button class='btn btn-primary' onclick={startSetup}>
        {i18n.t('app2fa.setup.startButton')}
        <ArrowRight size={16} />
      </button>

    {:else if step === 'scan'}
      <button class='btn btn-ghost' onclick={handleCancel}>
        {i18n.t('actions.cancel')}
      </button>
      <button class='btn btn-primary' onclick={() => { step = 'verify' }}>
        {i18n.t('app2fa.setup.nextButton')}
        <ArrowRight size={16} />
      </button>

    {:else if step === 'verify'}
      <button class='btn btn-ghost' onclick={() => { step = 'scan' }}>
        <ArrowLeft size={16} />
        {i18n.t('actions.back')}
      </button>
      <button
        class='btn btn-primary'
        onclick={handleVerify}
        disabled={!verificationCode.trim() || isVerifying}
      >
        {#if isVerifying}
          <span class='loading loading-spinner loading-sm'></span>
        {/if}
        {i18n.t('app2fa.setup.verifyButton')}
      </button>

    {:else if step === 'backup'}
      <button class='btn btn-primary w-full' onclick={handleComplete}>
        {i18n.t('app2fa.setup.completeButton')}
      </button>
    {/if}
  {/snippet}
</Modal>

<style>
  .steps-indicator {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.5rem 0 1rem;
  }

  .step-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: oklch(0.8 0 0);
    transition: all 0.2s ease;
  }

  .step-dot.active {
    background-color: oklch(0.55 0.2 260);
  }

  .step-dot.current {
    width: 24px;
    border-radius: 4px;
  }

  .step-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 1rem;
  }

  .checklist {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .checklist-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.625rem 0.75rem;
    border-radius: 0.5rem;
    background-color: oklch(0.97 0.005 260);
    font-size: 0.8125rem;
    color: oklch(0.4 0 0);
    text-align: left;
  }

  .checklist-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    border-radius: 0.375rem;
    background-color: oklch(0.55 0.2 260);
    color: white;
  }

  .step-description {
    color: oklch(0.6 0 0);
    font-size: 0.875rem;
    margin: 0;
    line-height: 1.6;
  }

  .qr-container {
    padding: 1rem;
    background: white;
    border-radius: 0.5rem;
    display: flex;
    justify-content: center;
  }

  .secret-section {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .secret-display {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background-color: oklch(0.95 0 0);
    border: 1px solid oklch(0.85 0 0);
    border-radius: 0.5rem;
    font-size: 0.875rem;
    word-break: break-all;
  }

  .verify-input-group {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
  }

  .backup-codes-grid {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }

  .backup-code {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background-color: oklch(0.95 0 0);
    border: 1px solid oklch(0.85 0 0);
    border-radius: 4px;
    font-size: 0.875rem;
  }

  .backup-code-index {
    color: oklch(0.5 0 0);
    font-size: 0.6875rem;
    min-width: 1.5em;
  }

  .backup-warning {
    width: 100%;
    padding: 1rem;
    background-color: oklch(0.85 0.1 85);
    color: oklch(0.35 0.1 85);
    border-radius: 0.5rem;
    font-size: 0.875rem;
  }

  .backup-warning p {
    margin: 0;
  }
</style>
