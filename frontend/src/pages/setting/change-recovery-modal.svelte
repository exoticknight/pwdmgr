<script lang='ts'>
  import Modal from '@/components/modal.svelte'
  import PasswordInput from '@/components/password-input.svelte'
  import { app } from '@/stores/app.svelte'
  import { auth } from '@/stores/auth.svelte'
  import { i18n } from '@/stores/i18n.svelte'
  import { notification } from '@/stores/notification.svelte'
  import { copyTextToClipboard } from '@/utils/clipboard'

  interface Props {
    isOpen: boolean
    onClose: () => void
  }

  const {
    isOpen,
    onClose,
  }: Props = $props()

  let mode = $state(auth.isRecoveryEnabled ? 'disable' : 'enable')
  let step = $state(0)
  let isLoading = $state(false)
  let errorMsg = $state('')

  let password = $state('')
  async function validatePassword() {
    errorMsg = ''

    try {
      await auth.validatePassword(password)
        ? step = 1
        : errorMsg = i18n.t('errors.passwordIncorrect')
    }
    catch (error) {
      console.error(error)
      errorMsg = i18n.t('errors.passwordIncorrect')
    }
  }

  let code = $state('')
  const firstLine = $derived(code.slice(0, 16).replace(/(.{4})/g, '$1 ').trim())
  const secondLine = $derived(code.slice(16, 32).replace(/(.{4})/g, '$1 ').trim())

  async function handleContinueToEnable() {
    errorMsg = ''
    isLoading = true
    try {
      code = await auth.enableRecovery()
      step = 2
      isLoading = false
    }
    catch (error) {
      console.error(error)
      errorMsg = i18n.t('errors.recoverError')
    }
  }

  async function handleContinueToDisable() {
    errorMsg = ''
    isLoading = true
    try {
      await auth.disableRecovery()
      step = 2
      isLoading = false
    }
    catch (error) {
      console.error(error)
      errorMsg = i18n.t('errors.recoverError')
    }
  }

  function handleCopy() {
    copyTextToClipboard(code)
      .then(() => {
        notification.success(i18n.t('notifications.copied'))
      })
      .catch(() => {
        notification.error(i18n.t('notifications.copyFailed'))
      })
  }

  function handlePrint() {
    window.print()
  }

  function handleClose() {
    app.markSettingAsUnsaved()
    onClose()
  }

  $effect(() => {
    if (!isOpen) {
      mode = auth.isRecoveryEnabled ? 'disable' : 'enable'
      errorMsg = ''
      step = 0
      password = ''
      code = ''
    }
  })
</script>

<Modal
  {isOpen}
  title={i18n.t(mode === 'enable' ? 'enableRecovery.enableTitle' : 'enableRecovery.disableTitle')}
  onClose={onClose}
  boxClass='max-w-lg'
>
  {#snippet children()}
    <div class='flex flex-col gap-2'>
      {#if step === 0}
        <fieldset class='fieldset w-full'>
          <PasswordInput
            bind:value={password}
            showStrength={false}
          />
        </fieldset>
      {:else}
        {#if mode === 'enable'}
          <div id='recovery-code' class='card w-full p-4 gap-4 border-2 outline-none select-none flex flex-col justify-center content-center items-center border-base-300'>
            {#if step === 1}
              <p class='text-center text-warning text-2xl'>{i18n.t('enableRecovery.tipBeforeEnable')}</p>
            {:else}
              {#if isLoading}
                <div class='skeleton h-[3rem] w-3/4'></div>
                <div class='skeleton h-[3rem] w-3/4'></div>
              {:else}
                <p class='select-text font-mono font-semibold tracking-widest text-center text-3xl'>{firstLine}</p>
                <p class='select-text font-mono font-semibold tracking-widest text-center text-3xl'>{secondLine}</p>
              {/if}
            {/if}
          </div>
        {/if}

        {#if mode === 'disable'}
          {#if step === 1}
            <p class='text-center text-error text-xl'>{i18n.t('enableRecovery.warnBeforeDisable')}</p>
          {:else}
            <p class='text-center text-error text-xl'>{i18n.t('enableRecovery.disabled')}</p>
          {/if}
        {/if}
      {/if}
      {#if errorMsg}
        <p class='text-center text-semibold text-error'>{errorMsg}</p>
      {:else}
        {#if mode === 'enable' && step === 2}
          <p class='text-center text-semibold text-error'>{i18n.t('enableRecovery.tipAfterEnabled')}</p>
        {/if}
      {/if}
    </div>
  {/snippet}

  {#snippet actions()}
    {#if step === 0}
      <button
        class='btn btn-soft btn-primary'
        onclick={validatePassword}
        disabled={password === ''}
      >
        {i18n.t('actions.ok')}
      </button>
    {:else if step === 1}
      {#if mode === 'enable'}
        <button class='btn btn-soft btn-error' onclick={handleContinueToEnable}>
          {i18n.t('actions.continueEnable')}
        </button>
      {/if}
      {#if mode === 'disable'}
        <button class='btn btn-soft btn-error' onclick={handleContinueToDisable}>
          {i18n.t('actions.continueDisable')}
        </button>
      {/if}
    {:else if step === 2}
      {#if mode === 'enable'}
        <button
          class='btn btn-soft btn-primary'
          onclick={handleCopy}
          disabled={isLoading}
        >
          {i18n.t('actions.copy')}
        </button>
        <button
          class='btn btn-soft btn-secondary'
          onclick={handlePrint}
          disabled={isLoading}
        >
          {i18n.t('actions.print')}
        </button>
      {/if}
      <button class='btn btn-soft' onclick={handleClose}>
        {i18n.t('actions.close')}
      </button>
    {/if}
  {/snippet}
</Modal>
