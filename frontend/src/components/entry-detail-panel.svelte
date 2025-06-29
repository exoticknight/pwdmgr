<script lang='ts'>
  import type { PasswordEntry } from '../types/password'
  import { Copy, Eye, EyeOff, Trash2 } from '@lucide/svelte'
  import i18next from '../i18n'
  import { notificationStore } from '../stores/notification.svelte'

  interface Props {
    entry: PasswordEntry | null
    onUpdate?: (data: { id: string, updates: Partial<PasswordEntry> }) => void
    onDelete?: (data: { id: string }) => void
    onMarkDirty?: () => void
  }

  const { entry, onUpdate, onDelete, onMarkDirty }: Props = $props()

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

  function handleDelete() {
    if (entry && onDelete) {
      // eslint-disable-next-line no-alert
      const confirmed = window.confirm(i18next.t('forms.confirmDelete'))
      if (confirmed) {
        onDelete({ id: entry.id })
      }
    }
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
  <div class='flex-1 flex items-center justify-center'>
    <div class='text-center text-base-content/60'>
      <h3 class='text-3xl font-light tracking-wider text-base-content/80'>
        secure simple local
      </h3>
    </div>
  </div>
{:else}
  <div class='h-full flex flex-col'>
    <!-- Content - Scrollable -->
    <div class='flex-1 overflow-y-auto'>
      <div class='p-6'>
        <fieldset class='fieldset'>
          <legend class='fieldset-legend'>{entry.title}</legend>

          <label class='label' for='username-input'>
            {i18next.t('forms.username')}
          </label>

          <div class='join'>
            <input
              id='username-input'
              type='text'
              class='input input-bordered flex-1 join-item'
              value={formData.username || ''}
              oninput={e => handleFieldChange('username', e.currentTarget.value)}
              placeholder={i18next.t('forms.usernamePlaceholder')}
            />
            <button
              class='btn join-item'
              onclick={() => copyToClipboard(entry.username)}
              title={i18next.t('actions.copy')}
            >
              <Copy class='w-4 h-4' />
            </button>
          </div>

          <!-- Password -->
          <label class='label' for='password-input'>
            {i18next.t('forms.password')}
          </label>

          <div class='join'>
            <input
              id='password-input'
              type={showPassword ? 'text' : 'password'}
              class='input input-bordered flex-1 join-item'
              value={formData.password || ''}
              oninput={e => handleFieldChange('password', e.currentTarget.value)}
              placeholder={i18next.t('forms.passwordPlaceholder')}
            />
            <button
              class='btn join-item'
              onclick={togglePasswordVisibility}
              title={showPassword ? i18next.t('actions.hide') : i18next.t('actions.show')}
            >
              {#if showPassword}
                <EyeOff class='w-4 h-4' />
              {:else}
                <Eye class='w-4 h-4' />
              {/if}
            </button>
            <button
              class='btn join-item'
              onclick={() => copyToClipboard(entry.password)}
              title={i18next.t('actions.copy')}
            >
              <Copy class='w-4 h-4' />
            </button>
          </div>

          <!-- Notes -->
          <label class='label' for='notes-input'>
            {i18next.t('forms.notes')}
          </label>

          <textarea
            id='notes-input'
            class='textarea h-32 w-full'
            value={formData.notes || ''}
            oninput={e => handleFieldChange('notes', e.currentTarget.value)}
            placeholder={i18next.t('forms.notesPlaceholder')}
          ></textarea>

          <!-- Delete Button -->
          <button class='btn btn-error w-full mt-8' onclick={handleDelete}>
            <Trash2 class='w-4 h-4 mr-2' />
            {i18next.t('forms.delete')}
          </button>

        </fieldset>
      </div>
    </div>
  </div>
{/if}
