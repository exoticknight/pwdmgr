<script lang='ts'>
  import { ArrowLeft, Plus, Save, Search } from '@lucide/svelte'
  import i18next from '../i18n'

  interface Props {
    hasUnsavedChanges: boolean
    searchTerm?: string
    onBack?: () => void
    onNew?: () => void
    onSave?: () => void
    onSearch?: (data: { term: string }) => void
  }

  const { hasUnsavedChanges, searchTerm = '', onBack, onNew, onSave, onSearch }: Props = $props()

  function handleBack() {
    onBack?.()
  }

  function handleNew() {
    onNew?.()
  }

  function handleSave() {
    onSave?.()
  }

  function handleSearchInput(event: Event) {
    const target = event.target as HTMLInputElement
    onSearch?.({ term: target.value })
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

  <!-- Center - Search -->
  <div class='toolbar-search'>
    <div class='search-box'>
      <Search size={14} />
      <input
        type='text'
        placeholder={i18next.t('search.placeholder')}
        class='search-input'
        value={searchTerm}
        oninput={handleSearchInput}
      />
    </div>
  </div>

  <!-- Right side - Add New (icon only) -->
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

  .toolbar-search {
    flex: 1;
    max-width: 200px;
    margin: 0 var(--space-md);
  }

  .search-box {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    padding: 0 var(--space-xs);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    background-color: var(--color-bg-primary);
    height: 28px;
  }

  .search-box:focus-within {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 1px var(--color-primary);
  }

  .search-input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font-size: var(--font-size-sm);
    color: var(--color-text-primary);
  }

  .search-input::placeholder {
    color: var(--color-text-muted);
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
