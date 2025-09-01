<script lang='ts'>
  import { Check, CircleQuestionMark, Eye, EyeOff, WandSparkles, X } from '@lucide/svelte'
  import { i18n } from '@/stores/i18n.svelte'
  import PasswordStrength from './password-strength.svelte'

  interface Props {
    value: string
    confirmValue: string
    shouldHide?: boolean
    showLabel?: boolean
    showStrength?: boolean
    enableGenerator?: boolean
    openGenerator?: () => void
  }

  let {
    value = $bindable(''),
    confirmValue = $bindable(''),
    shouldHide = true,
    showLabel = true,
    showStrength = true,
    enableGenerator = false,
    openGenerator = () => {},
  }: Props = $props()

  const passwordMatch = $derived.by(() => {
    if (!value || !confirmValue) {
      return null
    }
    return value === confirmValue
  })

  let showPassword = $state(!shouldHide)
  function togglePasswordVisibility() {
    showPassword = !showPassword
  }
</script>

{#if showLabel}
  <label class='label' for='new-password'>
    {i18n.t('changePassword.newPassword')} *
  </label>
{/if}
<div class='join w-full'>
  <input
    id='new-password'
    type={showPassword ? 'text' : 'password'}
    bind:value={value}
    placeholder={i18n.t('changePassword.newPasswordPlaceholder')}
    class='input join-item flex-1 font-mono'
    required
  />
  {#if shouldHide}
    <button
      type='button'
      class='btn join-item'
      onclick={togglePasswordVisibility}
      title={showPassword ? i18n.t('actions.hidePassword') : i18n.t('actions.showPassword')}
    >
      {#if showPassword}
        <EyeOff size={16} />
      {:else}
        <Eye size={16} />
      {/if}
    </button>
  {/if}
  {#if enableGenerator}
    <button
      type='button'
      class='btn join-item'
      onclick={openGenerator}
      title={i18n.t('passwordGenerator.title')}
    >
      <WandSparkles size={16} />
    </button>
  {/if}
</div>
{#if showStrength && !!value}
  <div class='mt-2'>
    <PasswordStrength password={value} />
  </div>
{/if}

{#if showLabel}
  <label class='label' for='confirm-password'>
    {i18n.t('changePassword.confirmPassword')} *
  </label>
{/if}
<div class='join w-full'>
  <input
    id='confirm-password'
    type={showPassword ? 'text' : 'password'}
    bind:value={confirmValue}
    placeholder={i18n.t('changePassword.confirmPasswordPlaceholder')}
    class='input join-item flex-1 font-mono'
    required
  />
  <div class='tooltip tooltip-left' data-tip={passwordMatch === null ? i18n.t('changePassword.passwordMatchUnknown') : passwordMatch ? i18n.t('changePassword.passwordMatch') : i18n.t('changePassword.passwordMismatch')}>
    <button
      type='button'
      class='btn join-item'
      class:text-white={passwordMatch !== null}
      class:btn-success={passwordMatch}
      class:btn-error={passwordMatch === false}
    >
      {#if passwordMatch === null}
        <CircleQuestionMark size={16} />
      {:else if passwordMatch}
        <Check size={16} />
      {:else}
        <X size={16} />
      {/if}
    </button>
  </div>
</div>
