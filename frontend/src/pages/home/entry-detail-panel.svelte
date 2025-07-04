<script lang='ts'>
  import type { PasswordEntry } from '../../types/password'
  import { Copy, Eye, EyeOff } from '@lucide/svelte'
  import i18next from '../../i18n'
  import { notificationStore } from '../../stores/notification.svelte'

  interface Props {
    entry: PasswordEntry | null
    onUpdate?: (data: { id: string, updates: Partial<PasswordEntry> }) => void
    onMarkDirty?: () => void
  }

  const { entry, onUpdate, onMarkDirty }: Props = $props()

  let formData = $state<Partial<PasswordEntry>>({})
  let showPassword = $state(false)

  // Update form data when entry changes
  $effect(() => {
    if (entry) {
      formData = { ...entry }
    }
    else {
      formData = {}
    }
  })
  function handleFieldChange(field: keyof PasswordEntry, value: string) {
    formData[field] = value as any
    onMarkDirty?.()

    // Auto-save when field changes
    if (entry && onUpdate) {
      onUpdate({ id: entry.id, updates: { [field]: value } })
    }
  }

  function togglePasswordVisibility() {
    showPassword = !showPassword
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      notificationStore.success(i18next.t('notifications.copied'))
    }).catch(() => {
      notificationStore.error(i18next.t('notifications.copyFailed'))
    })
  }
</script>

{#if !entry}
  <div class='detail-empty'>
    <div class='empty-content'>
      <p class='empty-subtitle'>{i18next.t('forms.emptySubtitle')}</p>
    </div>
  </div>
{:else}
  <div class='detail-panel'>
    <!-- Content - Scrollable -->
    <div class='detail-content'>
      <div class='form-section'>

        <!-- Username Field -->
        <div class='form-field'>
          <label class='field-label' for='username-input'>
            {i18next.t('forms.username')}
          </label>
          <div class='input-group'>
            <input
              id='username-input'
              type='text'
              class='field-input'
              value={formData.username || ''}
              oninput={e => handleFieldChange('username', e.currentTarget.value)}
              placeholder={i18next.t('forms.usernamePlaceholder')}
            />
            <button
              class='input-action-btn'
              onclick={() => copyToClipboard(entry.username)}
              title={i18next.t('actions.copy')}
            >
              <Copy size={16} />
            </button>
          </div>
        </div>

        <!-- Password Field -->
        <div class='form-field'>
          <label class='field-label' for='password-input'>
            {i18next.t('forms.password')}
          </label>
          <div class='input-group'>
            <input
              id='password-input'
              type={showPassword ? 'text' : 'password'}
              class='field-input'
              value={formData.password || ''}
              oninput={e => handleFieldChange('password', e.currentTarget.value)}
              placeholder={i18next.t('forms.passwordPlaceholder')}
            />
            <button
              class='input-action-btn'
              onclick={togglePasswordVisibility}
              title={showPassword ? i18next.t('actions.hidePassword') : i18next.t('actions.showPassword')}
            >
              {#if showPassword}
                <EyeOff size={16} />
              {:else}
                <Eye size={16} />
              {/if}
            </button>
            <button
              class='input-action-btn'
              onclick={() => copyToClipboard(entry.password)}
              title={i18next.t('actions.copy')}
            >
              <Copy size={16} />
            </button>
          </div>
        </div>

        <!-- Notes Field -->
        <div class='form-field'>
          <label class='field-label' for='notes-input'>
            {i18next.t('forms.notes')}
          </label>
          <textarea
            id='notes-input'
            class='field-textarea'
            value={formData.notes || ''}
            oninput={e => handleFieldChange('notes', e.currentTarget.value)}
            placeholder={i18next.t('forms.notesPlaceholder')}
            rows='4'
          ></textarea>
        </div>

      </div>
    </div>
  </div>
{/if}

<style>
  .detail-empty {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--color-bg-secondary);
  }

  .empty-content {
    text-align: center;
  }

  .empty-subtitle {
    font-size: var(--font-size-base);
    color: var(--color-text-muted);
    margin: 0;
  }

  .detail-panel {
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: var(--color-bg-primary);
  }

  .detail-content {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-md);
  }

  .form-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .form-field {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .field-label {
    font-size: var(--font-size-base);
    font-weight: 500;
    color: var(--color-text-primary);
  }

  .input-group {
    display: flex;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    overflow: hidden;
    background-color: var(--color-bg-primary);
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .input-group:focus-within {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px var(--color-focus);
  }

  .field-input {
    flex: 1;
    height: 36px;
    padding: 0 var(--space-sm);
    border: none;
    outline: none;
    background: transparent;
    font-size: var(--font-size-base);
    color: var(--color-text-primary);
  }

  .field-input::placeholder {
    color: var(--color-text-muted);
  }

  .field-textarea {
    width: 100%;
    padding: var(--space-sm);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    font-size: var(--font-size-base);
    color: var(--color-text-primary);
    background-color: var(--color-bg-primary);
    resize: vertical;
    min-height: 60px;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .field-textarea:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px var(--color-focus);
  }

  .field-textarea::placeholder {
    color: var(--color-text-muted);
  }

  .input-action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background-color: transparent;
    border: none;
    border-left: 1px solid var(--color-border);
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .input-action-btn:hover {
    background-color: var(--color-bg-tertiary);
    color: var(--color-text-primary);
  }

  .input-action-btn:active {
    background-color: var(--color-primary);
    color: white;
  }

  /* Scrollbar styling */
  .detail-content {
    scrollbar-width: thin;
    scrollbar-color: var(--color-border) transparent;
  }

  .detail-content::-webkit-scrollbar {
    width: 6px;
  }

  .detail-content::-webkit-scrollbar-track {
    background: transparent;
  }

  .detail-content::-webkit-scrollbar-thumb {
    background-color: var(--color-border);
    border-radius: 3px;
  }

  .detail-content::-webkit-scrollbar-thumb:hover {
    background-color: var(--color-text-muted);
  }
</style>
