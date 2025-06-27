<script lang='ts'>
  import type { PasswordEntry } from '../types/password'
  import { Copy, Edit, Eye, EyeOff, Trash2 } from '@lucide/svelte'
  import i18next from '../i18n'

  interface Props {
    entry: PasswordEntry
    showPassword: boolean
    onTogglePassword: () => void
    onCopyUsername: () => void
    onCopyPassword: () => void
    onEdit: () => void
    onDelete: () => void
  }

  const {
    entry,
    showPassword,
    onTogglePassword,
    onCopyUsername,
    onCopyPassword,
    onEdit,
    onDelete,
  }: Props = $props()
</script>

<tr>
  <td>
    <div class='font-medium text-gray-900'>{entry.title}</div>
    {#if entry.notes}
      <div class='text-sm text-gray-500'>{entry.notes}</div>
    {/if}
  </td>
  <td>
    <div class='flex items-center gap-2'>
      <span class='font-mono text-sm selectable' id={`username-${entry.id}`}>
        {entry.username}
      </span>
      <button
        class='btn btn-ghost btn-xs'
        onclick={onCopyUsername}
        title={i18next.t('actions.copy')}
      >
        <Copy class='w-3 h-3' />
      </button>
    </div>
  </td>
  <td>
    <div class='flex items-center gap-2'>
      <span class='font-mono text-sm selectable' id={`password-${entry.id}`}>
        {showPassword ? entry.password : '••••••••'}
      </span>
      <button
        class='btn btn-ghost btn-xs'
        onclick={onTogglePassword}
        title={showPassword ? i18next.t('actions.hide') : i18next.t('actions.show')}
      >
        {#if showPassword}
          <EyeOff class='w-3 h-3' />
        {:else}
          <Eye class='w-3 h-3' />
        {/if}
      </button>
      <button
        class='btn btn-ghost btn-xs'
        onclick={onCopyPassword}
        title={i18next.t('actions.copy')}
      >
        <Copy class='w-3 h-3' />
      </button>
    </div>
  </td>
  <td>
    {#if entry.url}
      <a
        href={entry.url}
        target='_blank'
        rel='noopener noreferrer'
        class='link link-primary text-sm selectable'
      >
        {entry.url}
      </a>
    {:else}
      <span class='text-base-content/50'>-</span>
    {/if}
  </td>
  <td>
    <div class='flex gap-1'>
      <button
        class='btn btn-ghost btn-xs'
        onclick={onEdit}
        title={i18next.t('actions.edit')}
      >
        <Edit class='w-3 h-3' />
      </button>
      <button
        class='btn btn-ghost btn-xs btn-error'
        onclick={onDelete}
        title={i18next.t('actions.delete')}
      >
        <Trash2 class='w-3 h-3' />
      </button>
    </div>
  </td>
</tr>
