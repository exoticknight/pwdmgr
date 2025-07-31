<script lang='ts'>
  import { ArrowLeft, CheckCircle, FolderOpen, Plus } from '@lucide/svelte'
  import { i18n } from '@/stores/i18n.svelte'

  interface Props {
    isNewDatabase: boolean
    selectedFile: File | null
    password: string
    confirmPassword: string
    isLoading?: boolean
    onSubmit: (event: SubmitEvent) => void
    onReset: () => void
  }

  let {
    isNewDatabase,
    selectedFile,
    password = $bindable(),
    confirmPassword = $bindable(),
    isLoading = false,
    onSubmit,
    onReset,
  }: Props = $props()
</script>

<div class='password-form'>
  <div class='form-header'>
    <div class='form-icon'>
      <CheckCircle size={24} />
    </div>
    <h2 class='form-title'>
      {isNewDatabase ? i18n.t('password.setTitle') : i18n.t('password.enterTitle')}
    </h2>
    <p class='form-subtitle'>
      {selectedFile ? `${i18n.t('common.file')}: ${selectedFile.name}` : i18n.t('password.newFile')}
    </p>
  </div>

  <form onsubmit={onSubmit} class='form-content'>
    <div class='form-field'>
      <label class='field-label' for='password'>
        {i18n.t('password.label')}
      </label>
      <input
        id='password'
        type='password'
        class='field-input'
        placeholder={i18n.t('password.placeholder')}
        bind:value={password}
        required
      />
    </div>

    {#if isNewDatabase}
      <div class='form-field'>
        <label class='field-label' for='confirmPassword'>
          {i18n.t('password.confirmLabel')}
        </label>
        <input
          id='confirmPassword'
          type='password'
          class='field-input'
          placeholder={i18n.t('password.confirmPlaceholder')}
          bind:value={confirmPassword}
          required
        />
      </div>
    {/if}

    <div class='form-actions'>
      <button
        type='button'
        class='btn-secondary'
        onclick={onReset}
        disabled={isLoading}
      >
        <ArrowLeft size={16} />
        {i18n.t('actions.back')}
      </button>
      <button
        type='submit'
        class='btn-primary'
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
    gap: var(--space-md);
  }

  .form-field {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .field-label {
    font-size: var(--font-size-base);
    font-weight: 500;
    color: var(--color-text-primary);
  }

  .field-input {
    height: 36px;
    padding: 0 var(--space-sm);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    font-size: var(--font-size-base);
    background-color: var(--color-bg-primary);
    color: var(--color-text-primary);
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .field-input:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px var(--color-focus);
  }

  .field-input::placeholder {
    color: var(--color-text-muted);
  }

  .form-actions {
    display: flex;
    gap: var(--space-md);
    margin-top: var(--space-md);
  }

  .btn-primary, .btn-secondary {
    flex: 1;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-sm);
    border: none;
    border-radius: var(--radius-md);
    font-size: var(--font-size-base);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-primary {
    background-color: var(--color-primary);
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    background-color: var(--color-primary-hover);
  }

  .btn-secondary {
    background-color: transparent;
    color: var(--color-text-secondary);
    border: 1px solid var(--color-border);
  }

  .btn-secondary:hover:not(:disabled) {
    background-color: var(--color-bg-tertiary);
    color: var(--color-text-primary);
  }

  .btn-primary:disabled, .btn-secondary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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
