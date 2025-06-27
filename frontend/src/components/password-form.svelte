<script lang='ts'>
  import { AlertCircle, ArrowLeft, CheckCircle, FolderOpen, Plus } from '@lucide/svelte'
  import i18next from '../i18n'

  interface Props {
    isNewDatabase: boolean
    selectedFile: File | null
    password: string
    confirmPassword: string
    error: string
    onSubmit: (event: SubmitEvent) => void
    onReset: () => void
  }

  let {
    isNewDatabase,
    selectedFile,
    password = $bindable(),
    confirmPassword = $bindable(),
    error,
    onSubmit,
    onReset,
  }: Props = $props()
</script>

<div class='p-8'>
  <div class='text-center mb-6'>
    <div class='w-12 h-12 bg-success text-success-content rounded-lg flex items-center justify-center mx-auto mb-4'>
      <CheckCircle class='w-6 h-6 text-white' />
    </div>
    <h2 class='text-xl font-semibold mb-2'>
      {isNewDatabase ? i18next.t('password.setTitle') : i18next.t('password.enterTitle')}
    </h2>
    <p class='text-base-content/70 selectable'>
      {selectedFile ? `${i18next.t('common.file')}: ${selectedFile.name}` : i18next.t('password.newFile')}
    </p>
  </div>

  <form onsubmit={onSubmit} class='space-y-4'>
    <div class='form-control'>
      <label class='label' for='password'>
        <span class='label-text'>{i18next.t('password.label')}</span>
      </label>
      <input
        id='password'
        type='password'
        class='input input-bordered w-full selectable'
        placeholder={i18next.t('password.placeholder')}
        bind:value={password}
        required
      />
    </div>

    {#if isNewDatabase}
      <div class='form-control'>
        <label class='label' for='confirmPassword'>
          <span class='label-text'>{i18next.t('password.confirmLabel')}</span>
        </label>
        <input
          id='confirmPassword'
          type='password'
          class='input input-bordered w-full selectable'
          placeholder={i18next.t('password.confirmPlaceholder')}
          bind:value={confirmPassword}
          required
        />
      </div>
    {/if}

    {#if error}
      <div class='alert alert-error'>
        <AlertCircle class='w-6 h-6' />
        <span>{error}</span>
      </div>
    {/if}

    <div class='flex gap-3 pt-4'>
      <button
        type='button'
        class='btn btn-outline flex-1'
        onclick={onReset}
      >
        <ArrowLeft class='w-4 h-4 mr-2' />
        {i18next.t('actions.back')}
      </button>
      <button
        type='submit'
        class='btn btn-primary flex-1'
      >
        {#if isNewDatabase}
          <Plus class='w-4 h-4 mr-2' />
          {i18next.t('actions.create')}
        {:else}
          <FolderOpen class='w-4 h-4 mr-2' />
          {i18next.t('actions.open')}
        {/if}
      </button>
    </div>
  </form>
</div>

<style>
</style>
