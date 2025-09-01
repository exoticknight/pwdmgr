<script lang='ts'>
  import { ArrowLeft, CircleQuestionMark, FolderOpen, Plus } from '@lucide/svelte'
  import { i18n } from '@/stores/i18n.svelte'

  interface Props {
    isNewDatabase: boolean
    isRecoverable: boolean
    selectedFile: string
    password: string
    confirmPassword: string
    isLoading?: boolean
    onSubmit: (event: SubmitEvent) => void
    onReset: () => void
    onRecover: () => void
  }

  let {
    isNewDatabase,
    isRecoverable,
    selectedFile,
    password = $bindable(),
    confirmPassword = $bindable(),
    isLoading = false,
    onSubmit,
    onReset,
    onRecover,
  }: Props = $props()
</script>

<div class='password-form'>
  <div class='form-header'>
    <div class='form-icon'>
      <CircleQuestionMark size={24} />
    </div>
    <h2 class='form-title'>
      {isNewDatabase ? i18n.t('password.setTitle') : i18n.t('password.enterTitle')}
    </h2>
    <p class='form-subtitle'>
      {selectedFile ? `${i18n.t('common.file')}: ${selectedFile}` : i18n.t('password.newFile')}
    </p>
  </div>

  <form onsubmit={onSubmit} class='form-content gap-2'>
    <input
      id='password'
      type='password'
      class='input w-full'
      placeholder={i18n.t('password.placeholder')}
      bind:value={password}
      required
    />

    {#if isNewDatabase}
      <input
        id='confirmPassword'
        type='password'
        class='input w-full'
        placeholder={i18n.t('password.confirmPlaceholder')}
        bind:value={confirmPassword}
        required
      />
    {:else if isRecoverable}
      <button
        type='button'
        class='link min-w-0 self-end'
        onclick={onRecover}
      >
        {i18n.t('password.forgetPassword')}
      </button>
    {/if}

    <div class='form-actions'>
      <button
        type='button'
        class='btn btn-outline flex-1'
        onclick={onReset}
        disabled={isLoading}
      >
        <ArrowLeft size={16} />
        {i18n.t('actions.back')}
      </button>
      <button
        type='submit'
        class='btn btn-primary flex-1'
        disabled={isLoading}
      >
        {#if isLoading}
          <span class='loading-spinner'></span>
          {i18n.t('common.loading')}
        {:else if isNewDatabase}
          <Plus size={16} />
          {i18n.t('actions.create')}
        {:else}
          <FolderOpen size={16} />
          {i18n.t('actions.open')}
        {/if}
      </button>
    </div>
  </form>
</div>

<style>
  .password-form {
    background-color: var(--color-bg-secondary);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-lg);
    width: 100%;
  }

  .form-header {
    text-align: center;
    margin-bottom: var(--space-md);
  }

  .form-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background-color: var(--color-success);
    color: white;
    border-radius: var(--radius-md);
    margin-bottom: var(--space-sm);
  }

  .form-title {
    font-size: var(--font-size-xl);
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0 0 var(--space-sm) 0;
  }

  .form-subtitle {
    font-size: var(--font-size-base);
    color: var(--color-text-secondary);
    margin: 0;
    word-break: break-all;
  }

  .form-content {
    display: flex;
    flex-direction: column;
  }

  .form-actions {
    display: flex;
    gap: var(--space-md);
    margin-top: var(--space-md);
  }

  .loading-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
    border-top: 2px solid currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
