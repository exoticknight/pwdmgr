<script lang='ts'>
  import { ArrowLeft, Plus, Save } from '@lucide/svelte'
  import i18next from '../i18n'

  interface Props {
    hasUnsavedChanges: boolean
    onBack?: () => void
    onNew?: () => void
    onSave?: () => void
  }

  const { hasUnsavedChanges, onBack, onNew, onSave }: Props = $props()

  function handleBack() {
    onBack?.()
  }

  function handleNew() {
    onNew?.()
  }

  function handleSave() {
    onSave?.()
  }
</script>

<div class='toolbar'>
  <!-- Left side - Navigation and File Operations -->
  <div class='toolbar-section'>
    <button
      class='toolbar-btn'
      onclick={handleBack}
      title={i18next.t('common.back')}
    >
      <ArrowLeft size={16} />
    </button>

    <div class='toolbar-divider'></div>

    <button
      class='toolbar-btn {hasUnsavedChanges ? 'toolbar-btn-warning' : ''}'
      onclick={handleSave}
      disabled={!hasUnsavedChanges}
      title={i18next.t('forms.save')}
    >
      <Save size={16} />
      {#if hasUnsavedChanges}
        <span class='unsaved-indicator'></span>
      {/if}
    </button>
  </div>

  <!-- Right side - Add New -->
  <div class='toolbar-section'>
    <button
      class='toolbar-btn toolbar-btn-primary'
      onclick={handleNew}
      title={i18next.t('forms.addEntry')}
    >
      <Plus size={16} />
    </button>
  </div>
</div>

<style>
  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-xs) var(--space-sm);
    background-color: var(--color-bg-secondary);
    border-bottom: 1px solid var(--color-border);
    height: 40px;
  }

  .toolbar-section {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
  }

  .toolbar-btn {
    position: relative;
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    height: 28px;
    padding: 0 var(--space-xs);
    background-color: transparent;
    border: none;
    border-radius: var(--radius-sm);
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .toolbar-btn:hover:not(:disabled) {
    background-color: var(--color-bg-tertiary);
    color: var(--color-text-primary);
  }

  .toolbar-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .toolbar-btn-primary {
    color: var(--color-primary);
  }

  .toolbar-btn-primary:hover:not(:disabled) {
    background-color: var(--color-primary);
    color: white;
  }

  .toolbar-btn-warning {
    color: var(--color-warning);
  }

  .toolbar-btn-warning:hover:not(:disabled) {
    background-color: var(--color-warning);
    color: white;
  }

  .toolbar-divider {
    width: 1px;
    height: 16px;
    background-color: var(--color-border);
    margin: 0 var(--space-xs);
  }

  .unsaved-indicator {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 4px;
    height: 4px;
    background-color: var(--color-warning);
    border-radius: 50%;
  }
</style>
