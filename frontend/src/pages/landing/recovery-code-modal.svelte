<script lang='ts'>
  import Modal from '@/components/modal.svelte'
  import PasswordNewInput from '@/components/password-new-input.svelte'

  import { auth } from '@/stores/auth.svelte'
  import { database } from '@/stores/database.svelte'
  import { i18n } from '@/stores/i18n.svelte'

  import RecoveryCodeInput from './recovery-code-input.svelte'

  interface Props {
    filePath: string
    isOpen: boolean
    onClose: () => void
    onEnd: () => void
  }

  const {
    filePath,
    isOpen,
    onClose,
    onEnd,
  }: Props = $props()

  let step = $state(0)
  let errorMessage = $state('')

  let recoveryCode = $state('')
  function handleRecoveryCodeInput() {
    errorMessage = ''
  }
  async function handleVerifyRecoveryCode() {
    try {
      await database.loadFromRecovery(filePath, recoveryCode)
      step = 1
    }
    catch (error) {
      errorMessage = 'Failed to verify recovery code'
      console.error('Failed to verify recovery code:', error)
    }
  }

  let newPassword = $state('')
  let confirmPassword = $state('')
  const passwordMatch = $derived(() => newPassword === confirmPassword)
  async function handleSetNewPassword() {
    try {
      await auth.changePassword(recoveryCode, newPassword)
      step = 2
    }
    catch (error) {
      errorMessage = 'Failed to set new password'
      console.error('Failed to set new password:', error)
    }
  }

  async function handleFinish() {
    try {
      await database.saveToFile(filePath)
      database.close()
      onEnd()
    }
    catch (error) {
      console.error('Failed to save recovery code:', error)
      errorMessage = 'Failed to save recovery code'
    }
  }

</script>

<Modal
  {isOpen}
  title={i18n.t('recovery.title')}
  onClose={onClose}
  boxClass='max-w-xl'
  showCloseButton={step !== 1}
>
  {#snippet children()}
    <div class='steps w-full mb-6'>
      <ul class='steps'>
        <li class='step {step >= 0 ? 'step-primary' : ''}'>Recovery Code</li>
        <li class='step {step >= 1 ? 'step-primary' : ''}'>Set New Password</li>
        <li class='step {step === 2 ? 'step-primary' : ''}'>Success</li>
      </ul>
    </div>

    {#if step === 0}
      <div class='flex flex-col px-6 gap-2'>
        <RecoveryCodeInput
          bind:value={recoveryCode}
          onInput={handleRecoveryCodeInput}
        />
        {#if errorMessage}
          <p class='text-error'>
            {errorMessage}
          </p>
        {/if}
      </div>
    {:else if step === 1}
      <div class='flex flex-col gap-2'>
        <fieldset class='fieldset w-full'>
          <PasswordNewInput
            bind:value={newPassword}
            bind:confirmValue={confirmPassword}
          />
        </fieldset>
        {#if errorMessage}
          <p class='text-error'>
            {errorMessage}
          </p>
        {/if}
      </div>
    {:else}
      <div class='flex flex-col items-center justify-center p-8'>
        <svg width='120' height='120' viewBox='0 0 120 120'>
          <circle cx='60' cy='60' r='50' fill='#4ade80' opacity='0.2' />
          <path d='M40 65 l15 15 l25 -35' stroke='#22c55e' stroke-width='6' fill='none' />
        </svg>
        <div class='font-bold text-lg mt-4'>Congratulations!</div>
        <div class='text-base-content/60'>Your password has been reset.</div>
      </div>
    {/if}
  {/snippet}

  {#snippet actions()}
    {#if step === 0}
      <button
        class='btn btn-primary'
        disabled={recoveryCode.length !== 32}
        onclick={handleVerifyRecoveryCode}
      >
        Next
      </button>
    {:else if step === 1}
      <button
        class='btn btn-primary'
        disabled={!newPassword || !confirmPassword || !passwordMatch}
        onclick={handleSetNewPassword}
      >
        Next
      </button>
    {:else}
      <button
        class='btn btn-success'
        onclick={handleFinish}
      >
        Finish
      </button>
    {/if}
  {/snippet}
</Modal>

<style>
  .steps {
    justify-content: center;
  }
</style>
