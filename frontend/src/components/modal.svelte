<script lang='ts'>
  import type { Snippet } from 'svelte'
  import { X } from '@lucide/svelte'
  import i18next from '@/i18n'

  interface Props {
    isOpen: boolean
    title: string
    onClose?: () => void
    showCloseButton?: boolean
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | string
    children: Snippet
    actions?: Snippet
  }

  const {
    isOpen,
    title,
    onClose,
    showCloseButton = true,
    maxWidth = 'md',
    children,
    actions,
  }: Props = $props()

  const maxWidthClasses = {
    'sm': 'max-w-sm',
    'md': 'max-w-md',
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    '2xl': 'max-w-2xl',
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && onClose) {
      onClose()
    }
  }

  function handleOverlayClick(event: MouseEvent) {
    if (event.target === event.currentTarget && onClose) {
      onClose()
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
  <div
    class='modal modal-open'
    onclick={handleOverlayClick}
    onkeydown={handleKeydown}
    role='dialog'
    aria-modal='true'
    aria-labelledby='modal-title'
    tabindex='-1'
  >
    <div class='modal-box {maxWidthClasses[maxWidth] ?? maxWidth}'>
      <!-- Header -->
      <div class='flex justify-between items-center mb-4'>
        <h3 id='modal-title' class='font-bold text-lg'>
          {title}
        </h3>
        {#if showCloseButton && onClose}
          <button
            type='button'
            class='btn btn-sm btn-ghost btn-circle'
            onclick={onClose}
            aria-label={i18next.t('accessibility.close')}
          >
            <X class='w-4 h-4' />
          </button>
        {/if}
      </div>

      <!-- Content -->
      <div class='modal-content'>
        {@render children()}
      </div>

      <!-- Actions -->
      {#if actions}
        <div class='modal-action'>
          {@render actions()}
        </div>
      {/if}
    </div>
  </div>
{/if}
