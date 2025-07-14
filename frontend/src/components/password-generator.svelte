<script lang='ts'>
  import type { PasswordGeneratorOptions } from '../utils/password-generator'
  import { Check, Copy, RefreshCcw, X } from '@lucide/svelte'
  import i18next from '../i18n'
  import { notification } from '../stores/notification.svelte'
  import { PasswordGenerator } from '../utils/password-generator'

  interface Props {
    onClose: () => void
    onSelect?: (password: string) => void
  }

  const { onClose, onSelect }: Props = $props()

  const options = $state<PasswordGeneratorOptions>({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: false,
    excludeAmbiguous: false,
  })

  let generatedPassword = $state('')
  let passwordStrength = $state<ReturnType<typeof PasswordGenerator.checkStrength> | null>(null)
  let copied = $state(false)

  // 生成密码
  function generatePassword() {
    try {
      generatedPassword = PasswordGenerator.generate(options)
      passwordStrength = PasswordGenerator.checkStrength(generatedPassword)
    }
    catch (error) {
      notification.error(String(error))
    }
  }

  // 复制密码
  async function copyPassword() {
    try {
      await navigator.clipboard.writeText(generatedPassword)
      copied = true
      notification.success(i18next.t('notifications.copied'))
      setTimeout(() => {
        copied = false
      }, 2000)
    }
    catch {
      notification.error(i18next.t('notifications.copyFailed'))
    }
  }

  // 选择密码
  function selectPassword() {
    if (generatedPassword) {
      onSelect?.(generatedPassword)
      onClose()
    }
  }

  // 初始生成
  generatePassword()

  // 当选项改变时重新生成
  $effect(() => {
    generatePassword()
  })
</script>

<div class='modal-overlay' onclick={onClose}>
  <div class='modal-content' onclick={e => e.stopPropagation()}>
    <div class='modal-header'>
      <h3 class='modal-title'>{i18next.t('passwordGenerator.title')}</h3>
      <button class='modal-close' onclick={onClose}>
        <X size={20} />
      </button>
    </div>

    <div class='modal-body'>
      <!-- 生成的密码 -->
      <div class='password-output'>
        <div class='password-display'>
          <input
            type='text'
            class='password-input'
            value={generatedPassword}
            readonly
          />
          <div class='password-actions'>
            <button class='action-btn' onclick={generatePassword} title={i18next.t('passwordGenerator.regenerate')}>
              <RefreshCcw size={16} />
            </button>
            <button class='action-btn' onclick={copyPassword} title={i18next.t('actions.copy')}>
              {#if copied}
                <Check size={16} />
              {:else}
                <Copy size={16} />
              {/if}
            </button>
          </div>
        </div>

        <!-- 密码强度 -->
        {#if passwordStrength}
          <div class='password-strength'>
            <div class='strength-bar'>
              <div class='strength-fill strength-{passwordStrength.strength}'
                   style:width='{(passwordStrength.score / 7) * 100}%'></div>
            </div>
            <span class='strength-text'>{i18next.t(`passwordGenerator.strength.${passwordStrength.strength}`)}</span>
          </div>
        {/if}
      </div>

      <!-- 生成选项 -->
      <div class='generator-options'>
        <div class='option-group'>
          <label class='option-label'>
            {i18next.t('passwordGenerator.length')}
            <input
              type='range'
              min='4'
              max='64'
              class='option-slider'
              bind:value={options.length}
            />
            <span class='option-value'>{options.length}</span>
          </label>
        </div>

        <div class='option-group'>
          <label class='option-checkbox'>
            <input type='checkbox' bind:checked={options.includeUppercase} />
            {i18next.t('passwordGenerator.includeUppercase')}
          </label>
          <label class='option-checkbox'>
            <input type='checkbox' bind:checked={options.includeLowercase} />
            {i18next.t('passwordGenerator.includeLowercase')}
          </label>
          <label class='option-checkbox'>
            <input type='checkbox' bind:checked={options.includeNumbers} />
            {i18next.t('passwordGenerator.includeNumbers')}
          </label>
          <label class='option-checkbox'>
            <input type='checkbox' bind:checked={options.includeSymbols} />
            {i18next.t('passwordGenerator.includeSymbols')}
          </label>
        </div>

        <div class='option-group'>
          <label class='option-checkbox'>
            <input type='checkbox' bind:checked={options.excludeSimilar} />
            {i18next.t('passwordGenerator.excludeSimilar')}
          </label>
          <label class='option-checkbox'>
            <input type='checkbox' bind:checked={options.excludeAmbiguous} />
            {i18next.t('passwordGenerator.excludeAmbiguous')}
          </label>
        </div>
      </div>
    </div>

    <div class='modal-footer'>
      <button class='btn btn-secondary' onclick={onClose}>
        {i18next.t('common.cancel')}
      </button>
      <button class='btn btn-primary' onclick={selectPassword}>
        {i18next.t('passwordGenerator.usePassword')}
      </button>
    </div>
  </div>
</div>

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal-content {
    background: white;
    border-radius: 8px;
    width: 480px;
    max-width: 90vw;
    max-height: 90vh;
    overflow: hidden;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid var(--color-border-light);
  }

  .modal-title {
    font-size: 1.2rem;
    font-weight: 600;
    margin: 0;
  }

  .modal-close {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 4px;
    color: var(--color-text-muted);
  }

  .modal-close:hover {
    background: var(--color-bg-secondary);
  }

  .modal-body {
    padding: 1.5rem;
  }

  .password-output {
    margin-bottom: 1.5rem;
  }

  .password-display {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .password-input {
    flex: 1;
    padding: 0.75rem;
    border: 2px solid var(--color-border);
    border-radius: 6px;
    font-family: monospace;
    font-size: 1rem;
    background: var(--color-bg-secondary);
  }

  .password-actions {
    display: flex;
    gap: 0.5rem;
  }

  .action-btn {
    padding: 0.75rem;
    border: 2px solid var(--color-border);
    border-radius: 6px;
    background: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .action-btn:hover {
    background: var(--color-bg-secondary);
  }

  .password-strength {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .strength-bar {
    flex: 1;
    height: 4px;
    background: var(--color-border-light);
    border-radius: 2px;
    overflow: hidden;
  }

  .strength-fill {
    height: 100%;
    transition: width 0.3s ease;
  }

  .strength-weak { background: #dc3545; }
  .strength-fair { background: #fd7e14; }
  .strength-good { background: #ffc107; }
  .strength-strong { background: #28a745; }

  .strength-text {
    font-size: 0.875rem;
    font-weight: 500;
    min-width: 60px;
  }

  .generator-options {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .option-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .option-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .option-slider {
    flex: 1;
    margin: 0 0.5rem;
  }

  .option-value {
    min-width: 2rem;
    text-align: center;
    font-weight: 600;
  }

  .option-checkbox {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    cursor: pointer;
  }

  .option-checkbox input {
    cursor: pointer;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    padding: 1rem;
    border-top: 1px solid var(--color-border-light);
  }

  .btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-secondary {
    background: var(--color-bg-secondary);
    color: var(--color-text-primary);
  }

  .btn-secondary:hover {
    background: var(--color-border);
  }

  .btn-primary {
    background: var(--color-primary);
    color: white;
  }

  .btn-primary:hover {
    background: var(--color-primary-hover);
  }
</style>
