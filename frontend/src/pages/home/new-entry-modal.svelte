<script lang='ts'>
  import type { BasicData, BasicDataKey, OmitBasicDataExcept, PasswordData } from '@/types/datafile'

  import { Key, Plus, X } from '@lucide/svelte'

  import Modal from '@/components/modal.svelte'
  import PasswordGenerator from '@/components/password-generator.svelte'
  import PasswordStrength from '@/components/password-strength.svelte'

  import i18next from '@/i18n'

  interface Props {
    dataType: BasicData[typeof BasicDataKey.TYPE]
    isOpen?: boolean
    onSave: (entry: OmitBasicDataExcept<PasswordData, 'TYPE'>) => void
    onCancel: () => void
  }

  const { isOpen = false, onSave, onCancel, dataType }: Props = $props()

  // Form state
  const form = $state({
    title: '',
    username: '',
    password: '',
    notes: '',
  })

  // UI state
  let showPasswordGenerator = $state(false)

  // Form validation
  const isValid = $derived(
    form.title.trim() && form.username.trim() && form.password.trim(),
  )

  function handleSubmit() {
    if (!isValid) {
      return
    }

    onSave({
      _type: dataType,
      title: form.title.trim(),
      username: form.username.trim(),
      password: form.password.trim(),
      notes: form.notes.trim(),
    })
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
</script>

<Modal
  {isOpen}
  title={i18next.t('forms.addEntry')}
  onClose={handleCancel}
  showCloseButton={false}
>
  {#snippet children()}
    <form onsubmit={handleFormSubmit}>
      <fieldset class='fieldset w-full'>
        <!-- Title -->
        <label class='label' for='title'>
          {i18next.t('forms.title')} *
        </label>
        <input
          id='title'
          type='text'
          bind:value={form.title}
          placeholder={i18next.t('forms.titlePlaceholder')}
          class='input w-full'
          required
        />

        <!-- Username -->
        <label class='label' for='username'>
          {i18next.t('forms.username')} *
        </label>
        <input
          id='username'
          type='text'
          bind:value={form.username}
          placeholder={i18next.t('forms.usernamePlaceholder')}
          class='input w-full'
          required
        />

        <!-- Password -->
        <label class='label' for='password'>
          {i18next.t('forms.password')} *
        </label>
        <div class='join w-full'>
          <input
            id='password'
            type='password'
            bind:value={form.password}
            placeholder={i18next.t('forms.passwordPlaceholder')}
            class='input join-item flex-1'
            required
          />
          <button
            type='button'
            class='btn join-item'
            onclick={handleOpenPasswordGenerator}
            title={i18next.t('passwordGenerator.title')}
          >
            <Key size={16} />
          </button>
        </div>
        <!-- Password strength indicator -->
        <PasswordStrength alwaysShow={true} password={form.password} />

        <!-- Notes -->
        <label class='label' for='notes'>
          {i18next.t('forms.notes')} *
        </label>
        <textarea
          id='notes'
          bind:value={form.notes}
          placeholder={i18next.t('forms.notesPlaceholder')}
          class='textarea textarea-bordered w-full'
          rows='3'
        ></textarea>
      </fieldset>
    </form>
  {/snippet}

  {#snippet actions()}
    <button type='button' class='btn btn-ghost' onclick={handleCancel}>
      <X class='w-4 h-4 mr-2' />
      {i18next.t('actions.cancel')}
    </button>
    <button
      type='submit'
      class='btn btn-primary'
      disabled={!isValid}
      onclick={handleSubmit}
    >
      <Plus class='w-4 h-4 mr-2' />
      {i18next.t('actions.add')}
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

<style>
</style>
