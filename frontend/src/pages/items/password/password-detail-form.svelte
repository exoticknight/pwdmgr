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

  let showPassword = $state(false)
  let showPasswordGenerator = $state(false)

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

<div class='flex flex-col space-y-6'>
  <div class='card bg-base-200 shadow-sm'>
    <div class='card-body p-4'>
      <h3 class='card-title text-lg mb-4'>{i18n.t('forms.loginCredentials')}</h3>

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
      <PasswordStrength alwaysShow={true} password={(formData as any).password || ''} />
    </div>
  </div>

  <div class='card bg-base-200 shadow-sm'>
    <div class='card-body p-4'>
      <h3 class='card-title text-lg mb-4'>{i18n.t('forms.accountInformation')}</h3>

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
  </div>

</div>

<PasswordGeneratorModal
  isOpen={showPasswordGenerator}
  onClose={closePasswordGenerator}
  onSelect={handlePasswordGenerated}
/>
