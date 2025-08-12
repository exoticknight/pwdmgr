<script lang='ts'>
  import { ChevronDown, Plus, Save, Search, Share } from '@lucide/svelte'
  import { i18n } from '@/stores/i18n.svelte'

  interface Props {
    hasUnsavedChanges: boolean
    searchTerm?: string
    onNew?: (entryType: 'password' | 'encrypted_text') => void
    onSave?: () => void
    onSearch?: (data: { term: string }) => void
    onExport?: () => void
  }

  const { hasUnsavedChanges, searchTerm = '', onNew, onSave, onSearch, onExport }: Props = $props()

  let showDropdown = $state(false)

  function handleNewPassword() {
    onNew?.('password')
    showDropdown = false
  }

  function handleNewEncryptedText() {
    onNew?.('encrypted_text')
    showDropdown = false
  }

  function handleSave() {
    onSave?.()
  }

  function handleExport() {
    onExport?.()
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
        placeholder={i18n.t('search.placeholder')}
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
      title={i18n.t('buttons.save')}
    >
      <Save size={16} />
      {#if hasUnsavedChanges}
        <span class='unsaved-indicator'></span>
      {/if}
    </button>

    <button
      class='toolbar-btn'
      onclick={handleExport}
      title={i18n.t('buttons.export')}
    >
      <Share size={16} />
    </button>

    <div class='dropdown {showDropdown ? 'dropdown-open' : ''}'>
      <button
        class='toolbar-btn dropdown-trigger'
        onclick={() => showDropdown = !showDropdown}
        title={i18n.t('buttons.newEntry')}
      >
        <Plus size={16} />
        <ChevronDown size={12} />
      </button>
      {#if showDropdown}
        <div class='dropdown-menu'>
          <button class='dropdown-item' onclick={handleNewPassword}>
            <Plus size={14} />
            {i18n.t('entryTypes.password')}
          </button>
          <button class='dropdown-item' onclick={handleNewEncryptedText}>
            <Plus size={14} />
            {i18n.t('entryTypes.encryptedText')}
          </button>
        </div>
      {/if}
    </div>
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

  /* Dropdown styles */
  .dropdown {
    position: relative;
  }

  .dropdown-trigger {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
  }

  .dropdown-menu {
    position: absolute;
    top: 100%;
    right: 0;
    min-width: 150px;
    background: var(--color-bg-primary);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    padding: var(--space-xs);
    margin-top: var(--space-xs);
  }

  .dropdown-item {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    width: 100%;
    padding: var(--space-xs) var(--space-sm);
    border: none;
    background: none;
    color: var(--color-text-primary);
    font-size: var(--font-size-sm);
    cursor: pointer;
    border-radius: var(--radius-sm);
    transition: background-color 0.15s ease;
  }

  .dropdown-item:hover {
    background-color: var(--color-bg-hover);
  }

  .dropdown-item:active {
    background-color: var(--color-primary-bg);
  }
</style>
