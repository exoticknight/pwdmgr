<script lang='ts'>
  import { Plus, Save, Search } from '@lucide/svelte'
  import i18next from '@/i18n'

  interface Props {
    hasUnsavedChanges: boolean
    searchTerm?: string
    onNew?: () => void
    onSave?: () => void
    onSearch?: (data: { term: string }) => void
  }

  const { hasUnsavedChanges, searchTerm = '', onNew, onSave, onSearch }: Props = $props()

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

<div class='top-toolbar'>
  <!-- Center - Search Box -->
  <div class='toolbar-section toolbar-center'>
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

  <!-- Right side - Actions -->
  <div class='toolbar-section'>
    <button
      class="toolbar-btn {hasUnsavedChanges ? 'toolbar-btn-warning' : ''}"
      onclick={handleSave}
      disabled={!hasUnsavedChanges}
      title={i18next.t('buttons.save')}
    >
      <Save size={16} />
      {#if hasUnsavedChanges}
        <span class='unsaved-indicator'></span>
      {/if}
    </button>

    <button
      class='toolbar-btn'
      onclick={handleNew}
      title={i18next.t('buttons.newEntry')}
    >
      <Plus size={16} />
    </button>
  </div>
</div>

<style>
  .top-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-sm) var(--space-md);
    background-color: var(--color-bg-secondary);
    border-bottom: 1px solid var(--color-border);
    min-height: 48px;
  }

  .toolbar-section {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
  }

  .toolbar-center {
    flex: 1;
    justify-content: center;
    max-width: 400px;
    margin: 0 var(--space-md);
  }

  .toolbar-btn {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    border-radius: var(--radius-sm);
    background-color: transparent;
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .toolbar-btn:hover {
    background-color: var(--color-bg-hover);
    color: var(--color-text-primary);
  }

  .toolbar-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .toolbar-btn:disabled:hover {
    background-color: transparent;
    color: var(--color-text-secondary);
  }

  .toolbar-btn-warning {
    color: var(--color-warning);
  }

  .toolbar-btn-warning:hover {
    background-color: var(--color-warning-bg);
  }

  .unsaved-indicator {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 6px;
    height: 6px;
    background-color: var(--color-warning);
    border-radius: 50%;
  }

  .search-box {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    padding: 0 var(--space-xs);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    background-color: var(--color-bg-primary);
    height: 32px;
    width: 100%;
    transition: border-color 0.15s ease;
  }

  .search-box:focus-within {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px var(--color-primary-bg);
  }

  .search-input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    color: var(--color-text-primary);
    font-size: var(--font-size-sm);
  }

  .search-input::placeholder {
    color: var(--color-text-placeholder);
  }
</style>
