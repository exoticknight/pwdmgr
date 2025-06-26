<script lang='ts'>
  import { AlertCircle, ArrowLeft, CheckCircle, FolderOpen, Plus } from '@lucide/svelte'
  import { t } from '../hooks/use-translation'

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

<div class='bg-white rounded-xl shadow-xl p-8 transition-all duration-500 transform animate-fade-in'>
  <div class='text-center mb-6'>
    <div class='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
      <CheckCircle class='w-8 h-8 text-green-600' />
    </div>
    <h2 class='text-2xl font-bold text-gray-800'>
      {isNewDatabase ? t('password.setTitle') : t('password.enterTitle')}
    </h2>
    <p class='text-gray-600 mt-2'>
      {selectedFile ? `${t('common.file')}: ${selectedFile.name}` : t('password.newFile')}
    </p>
  </div>

  <form onsubmit={onSubmit} class='space-y-4'>
    <div class='form-control'>
      <label class='label' for='password'>
        <span class='label-text'>{t('password.label')}</span>
      </label>
      <input
        id='password'
        type='password'
        class='input input-bordered w-full'
        placeholder={t('password.placeholder')}
        bind:value={password}
        required
      />
    </div>

    {#if isNewDatabase}
      <div class='form-control'>
        <label class='label' for='confirmPassword'>
          <span class='label-text'>{t('password.confirmLabel')}</span>
        </label>
        <input
          id='confirmPassword'
          type='password'
          class='input input-bordered w-full'
          placeholder={t('password.confirmPlaceholder')}
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
        {t('actions.back')}
      </button>
      <button
        type='submit'
        class='btn btn-primary flex-1'
      >
        {#if isNewDatabase}
          <Plus class='w-4 h-4 mr-2' />
          {t('actions.create')}
        {:else}
          <FolderOpen class='w-4 h-4 mr-2' />
          {t('actions.open')}
        {/if}
      </button>
    </div>
  </form>
</div>

<style>
  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fade-in {
    animation: fade-in 0.5s ease-out;
  }
</style>
