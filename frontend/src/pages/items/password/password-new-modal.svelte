<script lang='ts'>
  import type { OmitBasicDataExcept, PasswordData } from '@/types/data'

  import { WandSparkles } from '@lucide/svelte'

  import Modal from '@/components/modal.svelte'
  import PasswordGenerator from '@/components/password-generator.svelte'
  import PasswordStrength from '@/components/password-strength.svelte'

  import { i18n } from '@/stores/i18n.svelte'

  interface Props {
    isOpen?: boolean
    onSave: (entry: OmitBasicDataExcept<PasswordData, 'TYPE'>) => void
    onCancel: () => void
  }

  const { isOpen = false, onSave, onCancel }: Props = $props()

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
      _type: 'password',
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

  function handleSelectPassword(password: string) {
    form.password = password
    showPasswordGenerator = false
  }
</script>

<Modal
  {isOpen}
  title={i18n.t('forms.addEntry')}
  onClose={handleCancel}
  boxClass='max-w-fit'
>
  {#snippet children()}
    <div class='flex new-entry-panel'>
      <div class='flex-1 new-entry-panel-left'>
        <form onsubmit={handleFormSubmit}>
          <fieldset class='fieldset w-full'>
            <!-- Title -->
            <label class='label' for='title'>
              {i18n.t('forms.title')} *
            </label>
            <input
              id='title'
              type='text'
              bind:value={form.title}
              placeholder={i18n.t('forms.titlePlaceholder')}
              class='input w-full font-mono'
              required
            />

            <!-- Username -->
            <label class='label' for='username'>
              {i18n.t('forms.username')} *
            </label>
            <input
              id='username'
              type='text'
              bind:value={form.username}
              placeholder={i18n.t('forms.usernamePlaceholder')}
              class='input w-full font-mono'
              required
            />

            <!-- Password -->
            <label class='label' for='password'>
              {i18n.t('forms.password')} *
            </label>
            <div class='join w-full'>
              <input
                id='password'
                type='text'
                bind:value={form.password}
                placeholder={i18n.t('forms.passwordPlaceholder')}
                class='input join-item flex-1 font-mono'
                required
              />
              <button
                type='button'
                class='btn join-item'
                onclick={handleOpenPasswordGenerator}
                title={i18n.t('passwordGenerator.title')}
              >
                <WandSparkles size={16} />
              </button>
            </div>
            <!-- Password strength indicator -->
            <PasswordStrength alwaysShow={true} password={form.password} />

            <!-- Notes -->
            <label class='label' for='notes'>
              {i18n.t('forms.notes')} *
            </label>
            <textarea
              id='notes'
              bind:value={form.notes}
              placeholder={i18n.t('forms.notesPlaceholder')}
              class='textarea textarea-bordered w-full font-mono'
              rows='3'
            ></textarea>
          </fieldset>
        </form>
      </div>
      <div class='flex-1 new-entry-panel-right' class:!hidden={!showPasswordGenerator}>
        <PasswordGenerator
          onSelect={handleSelectPassword}
          length={16}
          includeUppercase={true}
          includeLowercase={true}
          includeNumbers={true}
          includeSymbols={true}
          excludeSimilar={false}
          excludeAmbiguous={false}
        />
      </div>
    </div>
  {/snippet}

  {#snippet actions()}
    <button
      type='submit'
      class='btn btn-primary'
      disabled={!isValid}
      onclick={handleSubmit}
    >
      {i18n.t('actions.add')}
    </button>
  {/snippet}
</Modal>

<style>
  .new-entry-panel {
    --panel-width: 25rem;
    display: flex;
    gap: 1rem;
  }

  .new-entry-panel-left {
    width: var(--panel-width);
  }

  .new-entry-panel-right {
    width: var(--panel-width);
  }
</style>
