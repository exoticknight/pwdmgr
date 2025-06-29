<script lang='ts'>
  import type { PasswordEntry } from '../types/password'
  import { Plus, Save, X } from '@lucide/svelte'
  import i18next from '../i18n'

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

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      handleCancel()
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
  <div class='modal modal-open'>
    <div class='modal-box'>
      <h3 class='font-bold text-lg'>
        {entry ? i18next.t('forms.editEntry') : i18next.t('forms.addEntry')}
      </h3>

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
          <input
            id='password'
            type='password'
            bind:value={form.password}
            placeholder={i18next.t('forms.passwordPlaceholder')}
            class='input input-bordered w-full'
            required
          />
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

        <!-- Actions -->
        <div class='modal-action'>
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
          >
            {#if entry}
              <Save class='w-4 h-4 mr-2' />
              {i18next.t('actions.update')}
            {:else}
              <Plus class='w-4 h-4 mr-2' />
              {i18next.t('actions.add')}
            {/if}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
