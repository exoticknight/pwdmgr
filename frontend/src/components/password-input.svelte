<script lang='ts'>
  import { Eye, EyeOff } from '@lucide/svelte'
  import { i18n } from '@/stores/i18n.svelte'
  import PasswordStrength from './password-strength.svelte'

  interface Props {
    value: string
    shouldHide?: boolean
    showLabel?: boolean
    showStrength?: boolean
  }

  let {
    value = $bindable(''),
    shouldHide = true,
    showLabel = true,
    showStrength = true,
  }: Props = $props()

  let showPassword = $state(!shouldHide)
  function togglePasswordVisibility() {
    showPassword = !showPassword
  }
</script>

{#if showLabel}
  <label class='label' for='old-password'>
    {i18n.t('changePassword.oldPassword')}
  </label>
{/if}
<div class='join w-full'>
  <input
    id='old-password'
    type={showPassword ? 'text' : 'password'}
    bind:value={value}
    placeholder={i18n.t('changePassword.oldPasswordPlaceholder')}
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
</div>
{#if showStrength && !!value}
  <div class='mt-2'>
    <PasswordStrength password={value} />
  </div>
{/if}
