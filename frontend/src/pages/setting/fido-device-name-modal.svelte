<script lang='ts'>
  import Modal from '@/components/modal.svelte'
  import { i18n } from '@/stores/i18n.svelte'

  interface Props {
    isOpen: boolean
    defaultName: string
    onConfirm: (name: string) => void
    onCancel: () => void
  }

  const { isOpen, defaultName, onConfirm, onCancel }: Props = $props()

  let deviceName = $state('')

  $effect(() => {
    if (isOpen) {
      deviceName = defaultName
    }
  })

  function handleConfirm() {
    const trimmed = deviceName.trim()
    if (trimmed) {
      onConfirm(trimmed)
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && deviceName.trim()) {
      handleConfirm()
    }
  }
</script>

<Modal
  {isOpen}
  title={i18n.t('setting.security.fidoNameModalTitle')}
  onClose={onCancel}
  boxClass='max-w-sm'
>
  {#snippet children()}
    <p class='text-sm text-base-content/70 mb-4'>
      {i18n.t('setting.security.fidoNameModalDescription')}
    </p>
    <div class='form-control'>
      <label class='label' for='fido-device-name'>
        <span class='label-text'>{i18n.t('setting.security.fidoNameInputLabel')}</span>
      </label>
      <input
        id='fido-device-name'
        type='text'
        class='input input-bordered w-full'
        placeholder={i18n.t('setting.security.fidoDeviceNamePlaceholder')}
        bind:value={deviceName}
        onkeydown={handleKeydown}
        maxlength={64}
      />
    </div>
  {/snippet}

  {#snippet actions()}
    <button class='btn btn-ghost' onclick={onCancel}>
      {i18n.t('common.cancel')}
    </button>
    <button
      class='btn btn-primary'
      disabled={!deviceName.trim()}
      onclick={handleConfirm}
    >
      {i18n.t('common.confirm')}
    </button>
  {/snippet}
</Modal>
