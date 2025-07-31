<script lang='ts'>
  import { Trash2 } from '@lucide/svelte'
  import { i18n } from '@/stores/i18n.svelte'

  interface Props {
    entryTitle?: string
    onDelete?: () => void
  }

  const { entryTitle, onDelete }: Props = $props()

  function handleDelete() {
    onDelete?.()
  }
</script>

<div class='detail-toolbar'>
  <!-- Left side - Entry Title -->
  <div class='toolbar-section'>
    {#if entryTitle}
      <h2 class='entry-title'>{entryTitle}</h2>
    {/if}
  </div>

  <!-- Right side - Actions -->
  <div class='toolbar-section'>
    {#if entryTitle}
      <button
        class='toolbar-btn toolbar-btn-danger'
        onclick={handleDelete}
        title={i18n.t('actions.delete')}
      >
        <Trash2 size={16} />
      </button>
    {/if}
  </div>
</div>

<style>
  .detail-toolbar {
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

  .entry-title {
    font-size: var(--font-size-lg);
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 300px;
  }

  .toolbar-btn {
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

  .toolbar-btn-danger {
    color: var(--color-danger);
  }

  .toolbar-btn-danger:hover {
    background-color: var(--color-danger);
    color: white;
  }
</style>
