<script lang='ts'>
  import type { DialogResult } from '@/types/dialog'
  import i18next from '@/i18n'
  import { dialog } from '@/stores/dialog.svelte'

  let inputValue = $state('')

  $effect(() => {
    if (dialog.state.isOpen && dialog.state.options?.type === 'prompt') {
      inputValue = dialog.state.options.defaultValue || ''
    }
  })

  function handleConfirm() {
    const result: DialogResult = {
      confirmed: true,
      value: dialog.state.options?.type === 'prompt' ? inputValue : undefined,
    }
    dialog.close(result)
  }

  function handleCancel() {
    dialog.close({ confirmed: false })
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && dialog.state.options?.type !== 'prompt') {
      handleConfirm()
    }
  }

  const showCancelButton = $derived(
    dialog.state.options?.type === 'confirm' || dialog.state.options?.type === 'prompt',
  )

  function getMessageClass(type?: string): string {
    switch (type) {
      case 'error': return 'text-error'
      case 'warning': return 'text-warning'
      case 'info': return ''
      default: return ''
    }
  }
</script>

{#if dialog.state.isOpen && dialog.state.options}
  <div
    class='modal modal-open'
    onkeydown={handleKeydown}
    role='dialog'
    aria-modal='true'
    tabindex='-1'
  >
    <div class='modal-box'>
      {#if dialog.state.options.title}
        <h3 class='font-bold text-lg'>{dialog.state.options.title}</h3>
      {/if}

      <p class='py-4 {getMessageClass(dialog.state.options.type)}'>{dialog.state.options.message}</p>

      {#if dialog.state.options.type === 'prompt'}
        <div class='form-control mb-4'>
          <input
            bind:value={inputValue}
            class='input input-bordered w-full'
            type='text'
            onkeydown={e => e.key === 'Enter' && handleConfirm()}
          />
        </div>
      {/if}

      <div class='modal-action'>
        {#if showCancelButton}
          <button class='btn' onclick={handleCancel}>
            {dialog.state.options.cancelText || i18next.t('dialogs.cancel')}
          </button>
        {/if}
        <button
          class='btn btn-primary'
          onclick={handleConfirm}
        >
          {dialog.state.options.confirmText || i18next.t('dialogs.ok')}
        </button>
      </div>
    </div>
  </div>
{/if}
