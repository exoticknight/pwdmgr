<script lang='ts'>
  import type { PasswordEntry } from '../../types/password'
  import { Key, Plus, Save, X } from '@lucide/svelte'
  import Modal from '../../components/modal.svelte'
  import PasswordGenerator from '../../components/password-generator.svelte'
  import PasswordStrength from '../../components/password-strength.svelte'
  import i18next from '../../i18n'

  interface Props {
    entry?: PasswordEntry | null
    isOpen?: boolean
    onSave: (entry: PasswordEntry | Omit<PasswordEntry, 'id'>) => void
    onCancel: () => void
  }

  const { entry = null, isOpen = false, onSave, onCancel }: Props = $props()

  // Form state
  const form = $state({
    title: '',
    username: '',
    password: '',
    notes: '',
  })

  // UI state
  let showPasswordGenerator = $state(false)
  let showPassword = $state(false)

  // Reset form when entry changes
  $effect(() => {
    if (entry) {
      form.title = entry.title
      form.username = entry.username
      form.password = entry.password
      form.notes = entry.notes || ''
    }
    else {
      form.title = ''
      form.username = ''
      form.password = ''
      form.notes = ''
    }
  })

  // Form validation
  const isValid = $derived(
    form.title.trim() && form.username.trim() && form.password.trim(),
  )

  function handleSubmit() {
    if (!isValid) {
      return
    }

    if (entry) {
      // Edit mode
      onSave({
        id: entry.id,
        title: form.title.trim(),
        username: form.username.trim(),
        password: form.password.trim(),
        notes: form.notes.trim(),
      })
    }
    else {
      // Add mode
      onSave({
        title: form.title.trim(),
        username: form.username.trim(),
        password: form.password.trim(),
        notes: form.notes.trim(),
      })
    }
  }

  function handleFormSubmit(e: Event) {
    e.preventDefault()
    handleSubmit()
  }

  function handleCancel() {
    onCancel()
  }

  function handleOpenPasswordGenerator() {
    showPasswordGenerator = true
  }

  function handleClosePasswordGenerator() {
    showPasswordGenerator = false
  }

  function handleSelectPassword(password: string) {
    form.password = password
    showPasswordGenerator = false
  }

  function togglePasswordVisibility() {
    showPassword = !showPassword
  }
</script>

<Modal
  {isOpen}
  title={entry ? i18next.t('forms.editEntry') : i18next.t('forms.addEntry')}
  onClose={handleCancel}
  showCloseButton={false}
>
  {#snippet children()}
    <form onsubmit={handleFormSubmit} class='py-4'>
      <!-- Title -->
      <div class='form-control w-full mb-4'>
        <label class='label' for='title'>
          <span class='label-text'>{i18next.t('forms.title')} *</span>
        </label>
        <input
          id='title'
          type='text'
          bind:value={form.title}
          placeholder={i18next.t('forms.titlePlaceholder')}
          class='input input-bordered w-full'
          required
        />
      </div>

      <!-- Username -->
      <div class='form-control w-full mb-4'>
        <label class='label' for='username'>
          <span class='label-text'>{i18next.t('forms.username')} *</span>
        </label>
        <input
          id='username'
          type='text'
          bind:value={form.username}
          placeholder={i18next.t('forms.usernamePlaceholder')}
          class='input input-bordered w-full'
          required
        />
      </div>

      <!-- Password -->
      <div class='form-control w-full mb-4'>
        <label class='label' for='password'>
          <span class='label-text'>{i18next.t('forms.password')} *</span>
        </label>
        <div class='input-group'>
          <input
            id='password'
            type={showPassword ? 'text' : 'password'}
            bind:value={form.password}
            placeholder={i18next.t('forms.passwordPlaceholder')}
            class='input input-bordered w-full'
            required
          />
          <button
            type='button'
            class='btn btn-outline btn-square'
            onclick={togglePasswordVisibility}
            title={showPassword ? i18next.t('actions.hidePassword') : i18next.t('actions.showPassword')}
          >
            {#if showPassword}
              <svg class='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L12 12m-2.122-2.122l4.242 4.242M12 12l2.878 2.878m-5.757-5.757l2.879 2.879M12 12l2.878 2.878'></path>
              </svg>
            {:else}
              <svg class='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'></path>
                <path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'></path>
              </svg>
            {/if}
          </button>
          <button
            type='button'
            class='btn btn-outline btn-square'
            onclick={handleOpenPasswordGenerator}
            title={i18next.t('passwordGenerator.title')}
          >
            <Key class='w-4 h-4' />
          </button>
        </div>

        <!-- Password strength indicator -->
        <PasswordStrength password={form.password} />
      </div>

      <!-- Notes -->
      <div class='form-control w-full mb-4'>
        <label class='label' for='notes'>
          <span class='label-text'>{i18next.t('forms.notes')}</span>
        </label>
        <textarea
          id='notes'
          bind:value={form.notes}
          placeholder={i18next.t('forms.notesPlaceholder')}
          class='textarea textarea-bordered w-full'
          rows='3'
        ></textarea>
      </div>
    </form>
  {/snippet}

  {#snippet actions()}
    <button
      type='button'
      class='btn btn-ghost'
      onclick={handleCancel}
    >
      <X class='w-4 h-4 mr-2' />
      {i18next.t('actions.cancel')}
    </button>
    <button
      type='submit'
      class='btn btn-primary'
      disabled={!isValid}
      onclick={handleSubmit}
    >
      {#if entry}
        <Save class='w-4 h-4 mr-2' />
        {i18next.t('actions.update')}
      {:else}
        <Plus class='w-4 h-4 mr-2' />
        {i18next.t('actions.add')}
      {/if}
    </button>
  {/snippet}
</Modal>

<!-- Password Generator Modal -->
{#if showPasswordGenerator}
  <PasswordGenerator
    onClose={handleClosePasswordGenerator}
    onSelect={handleSelectPassword}
  />
{/if}
