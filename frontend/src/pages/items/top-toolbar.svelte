<script lang='ts'>
  import { ChevronDown, Search, Share } from '@lucide/svelte'
  import { i18n } from '@/stores/i18n.svelte'

  interface Props {
    searchTerm?: string
    onNew?: (entryType: 'password' | 'encrypted_text') => void
    onSearch?: (data: { term: string }) => void
    onExport?: () => void
  }

  const { searchTerm = '', onNew, onSearch, onExport }: Props = $props()

  function handleNewPassword() {
    onNew?.('password')
  }

  function handleNewEncryptedText() {
    onNew?.('encrypted_text')
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
  <div class='toolbar-section'>
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
      class='btn btn-sm join-item'
      onclick={handleExport}
      title={i18n.t('buttons.export')}
    >
      <Share size={16} />
    </button>

    <div class='dropdown dropdown-end'>
      <div tabindex='0' role='button' class='btn btn-sm btn-soft'>
        {i18n.t('buttons.newEntry')}<ChevronDown size={12} />
      </div>
      <ul class='dropdown-content menu bg-base-100 rounded-box min-w-24 shadow-sm'>
        <li>
          <button onclick={handleNewPassword}>
            {i18n.t('entryTypes.password')}
          </button>
        </li>
        <li>
          <button onclick={handleNewEncryptedText}>
            {i18n.t('entryTypes.encryptedText')}
          </button>
        </li>
      </ul>
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
