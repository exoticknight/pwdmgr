<script lang='ts'>
  import type { PasswordData } from '../../types/datafile'
  import { Copy, Eye, EyeOff, Heart } from '@lucide/svelte'
  import PasswordStrength from '../../components/password-strength.svelte'
  import i18next from '../../i18n'
  import { notification } from '../../stores/notification.svelte'

  interface Props {
    entry: PasswordData | null
    onUpdate?: (data: { id: string, updates: Partial<PasswordData> }) => void
    onMarkDirty?: () => void
  }

  const { entry, onUpdate, onMarkDirty }: Props = $props()

  let formData = $state<Partial<PasswordData>>({})
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
  function handleFieldChange(field: keyof PasswordData, value: string) {
    formData[field] = value as any
    onMarkDirty?.()

    // Auto-save when field changes
    if (entry && onUpdate) {
      onUpdate({ id: entry._id, updates: { [field]: value } })
    }
  }

  function togglePasswordVisibility() {
    showPassword = !showPassword
  }

  function copyToClipboard(text: string) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        notification.success(i18next.t('notifications.copied'))
      })
      .catch(() => {
        notification.error(i18next.t('notifications.copyFailed'))
      })
  }

  function toggleFavorite() {
    if (entry && onUpdate) {
      const newFavoriteStatus = !entry._isFavorite
      onUpdate({
        id: entry._id,
        updates: {
          _isFavorite: newFavoriteStatus,
        },
      })
      onMarkDirty?.()
    }
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
    <!-- Header with title and favorite button -->
    <div class='detail-header'>
      <h2 class='detail-title'>{entry.title}</h2>
      <button
        type='button'
        class='btn btn-ghost favorite-btn'
        onclick={toggleFavorite}
        title={entry._isFavorite
          ? i18next.t('actions.removeFromFavorites')
          : i18next.t('actions.addToFavorites')}
      >
        <Heart
          size={20}
          class={entry._isFavorite ? 'favorite-active' : 'favorite-inactive'}
        />
      </button>
    </div>

    <!-- Content - Scrollable -->
    <div class='detail-content'>
      <fieldset class='fieldset w-full'>
        <!-- Username Field -->
        <label class='label' for='username-input'>
          {i18next.t('forms.username')}
        </label>
        <div class='join w-full'>
          <input
            id='username-input'
            type='text'
            class='input join-item flex-1'
            value={formData.username || ''}
            oninput={e =>
              handleFieldChange('username', e.currentTarget.value)}
            placeholder={i18next.t('forms.usernamePlaceholder')}
          />
          <button
            type='button'
            class='btn join-item'
            onclick={() => copyToClipboard(entry.username)}
            title={i18next.t('actions.copy')}
          >
            <Copy size={16} />
          </button>
        </div>

        <!-- Password Field -->
        <label class='label' for='password-input'>
          {i18next.t('forms.password')}
        </label>
        <div class='join w-full'>
          <input
            id='password-input'
            type={showPassword ? 'text' : 'password'}
            class='input join-item flex-1'
            value={formData.password || ''}
            oninput={e =>
              handleFieldChange('password', e.currentTarget.value)}
            placeholder={i18next.t('forms.passwordPlaceholder')}
          />
          <button
            type='button'
            class='btn join-item'
            onclick={togglePasswordVisibility}
            title={showPassword
              ? i18next.t('actions.hidePassword')
              : i18next.t('actions.showPassword')}
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
            onclick={() => copyToClipboard(entry.password)}
            title={i18next.t('actions.copy')}
          >
            <Copy size={16} />
          </button>
        </div>
        <!-- Password strength indicator -->
        <PasswordStrength alwaysShow={true} password={formData.password || ''} />

        <!-- Notes Field -->
        <label class='label' for='notes-input'>
          {i18next.t('forms.notes')}
        </label>
        <textarea
          id='notes-input'
          class='textarea w-full'
          value={formData.notes || ''}
          oninput={e => handleFieldChange('notes', e.currentTarget.value)}
          placeholder={i18next.t('forms.notesPlaceholder')}
          rows='4'
        ></textarea>
      </fieldset>
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

  .detail-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-md);
    border-bottom: 1px solid var(--color-border);
    background-color: var(--color-bg-primary);
  }

  .detail-title {
    font-size: var(--font-size-lg);
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .favorite-btn {
    padding: var(--space-xs);
    min-height: auto;
    border-radius: var(--radius-md);
  }

  .favorite-btn:hover {
    background-color: var(--color-bg-secondary);
  }

  :global(.favorite-active) {
    fill: var(--color-error);
    color: var(--color-error);
  }

  :global(.favorite-inactive) {
    fill: none;
    color: var(--color-text-muted);
  }

  :global(.favorite-inactive:hover) {
    color: var(--color-error);
  }

  .detail-content {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-md);
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
