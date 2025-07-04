<script lang='ts'>
  import { Search } from '@lucide/svelte'
  import i18next from '../i18n'

  interface Props {
    searchTerm?: string
    onSearch?: (data: { term: string }) => void
  }

  const { searchTerm = '', onSearch }: Props = $props()

  function handleSearchInput(event: Event) {
    const target = event.target as HTMLInputElement
    onSearch?.({ term: target.value })
  }
</script>

<div class='search-container'>
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

<style>
  .search-container {
    padding: var(--space-sm);
    border-bottom: 1px solid var(--color-border-light);
    background-color: var(--color-bg-secondary);
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
    transition: border-color 0.15s ease;
  }

  .search-box:focus-within {
    border-color: var(--color-primary);
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
</style>
