<script lang='ts'>
  import type { PasswordData } from '@/types/data'

  import { Copy, ExternalLink, Eye, EyeOff, WandSparkles } from '@lucide/svelte'

  import { BrowserOpenURL } from '@/../wailsjs/runtime/runtime'
  import PasswordStrength from '@/components/password-strength.svelte'
  import { i18n } from '@/stores/i18n.svelte'

  import PasswordGeneratorModal from './password-generator-modal.svelte'

  interface Props {
    entry: PasswordData
    formData: Partial<PasswordData>
    onFieldChange: (field: string, value: string) => void
    onCopyToClipboard: (text: string) => void
  }

  const {
    entry,
    formData,
    onFieldChange,
    onCopyToClipboard,
  }: Props = $props()

  // Password-specific UI state - internal to this component
  let showPassword = $state(false)
  let showPasswordGenerator = $state(false)

  // Password-specific handlers - internal functionality
  function togglePasswordVisibility() {
    showPassword = !showPassword
  }

  function openPasswordGenerator() {
    showPasswordGenerator = true
  }

  function closePasswordGenerator() {
    showPasswordGenerator = false
  }

  function handlePasswordGenerated(password: string) {
    onFieldChange('password', password)
    closePasswordGenerator()
  }

  function handleOpenUrl() {
    const url = formData.url || entry.url
    if (url) {
      BrowserOpenURL(url)
    }
  }
</script>

<div class='password-detail-form'>
  <!-- Username Field -->
  <label class='label' for='username-input'>
    {i18n.t('forms.username')}
  </label>
  <div class='join w-full'>
    <input
      id='username-input'
      type='text'
      class='input join-item flex-1'
      value={formData.username || ''}
      oninput={e => onFieldChange('username', e.currentTarget.value)}
      placeholder={i18n.t('forms.usernamePlaceholder')}
    />
    <button
      type='button'
      class='btn join-item'
      onclick={() => onCopyToClipboard(entry.username || '')}
      title={i18n.t('actions.copy')}
    >
      <Copy size={16} />
    </button>
  </div>

  <!-- Password Field -->
  <label class='label' for='password-input'>
    {i18n.t('forms.password')}
  </label>
  <div class='join w-full'>
    <input
      id='password-input'
      type={showPassword ? 'text' : 'password'}
      class='input join-item flex-1'
      value={formData.password || ''}
      oninput={e => onFieldChange('password', e.currentTarget.value)}
      placeholder={i18n.t('forms.passwordPlaceholder')}
    />
    <button
      type='button'
      class='btn join-item'
      onclick={togglePasswordVisibility}
      title={showPassword
        ? i18n.t('actions.hidePassword')
        : i18n.t('actions.showPassword')}
    >
      {#if showPassword}
        <EyeOff size={16} />
      {:else}
        <Eye size={16} />
      {/if}
    </button>
    <button
      type='button'
      class='btn join-item'
      onclick={openPasswordGenerator}
      title={i18n.t('passwordGenerator.title')}
    >
      <WandSparkles size={16} />
    </button>
    <button
      type='button'
      class='btn join-item'
      onclick={() => onCopyToClipboard(entry.password || '')}
      title={i18n.t('actions.copy')}
    >
      <Copy size={16} />
    </button>
  </div>
  <!-- Password strength indicator -->
  <PasswordStrength alwaysShow={true} password={(formData as any).password || ''} />

  <!-- URL Field -->
  <label class='label' for='url-input'>
    {i18n.t('forms.url')}
  </label>
  <div class='join w-full'>
    <input
      id='url-input'
      type='url'
      class='input join-item flex-1'
      value={formData.url || ''}
      oninput={e => onFieldChange('url', e.currentTarget.value)}
      placeholder={i18n.t('forms.urlPlaceholder')}
    />
    <button
      type='button'
      class='btn join-item'
      onclick={() => onCopyToClipboard(entry.url || '')}
      title={i18n.t('actions.copy')}
      disabled={!formData.url && !entry.url}
    >
      <Copy size={16} />
    </button>
    <button
      type='button'
      class='btn join-item'
      onclick={handleOpenUrl}
      title={i18n.t('actions.openUrl')}
      disabled={!formData.url && !entry.url}
    >
      <ExternalLink size={16} />
    </button>
  </div>

  <!-- Notes Field -->
  <label class='label' for='notes-input'>
    {i18n.t('forms.notes')}
  </label>
  <textarea
    id='notes-input'
    class='textarea w-full'
    value={formData.notes || ''}
    oninput={e => onFieldChange('notes', e.currentTarget.value)}
    placeholder={i18n.t('forms.notesPlaceholder')}
    rows='4'
  ></textarea>
</div>

<!-- Password Generator Modal -->
<PasswordGeneratorModal
  isOpen={showPasswordGenerator}
  onClose={closePasswordGenerator}
  onSelect={handlePasswordGenerated}
/>

<style>
  .password-detail-form {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }
</style>
