<script lang='ts'>
  import Modal from '@/components/modal.svelte'
  import PasswordGenerator from '@/components/password-generator.svelte'
  import { i18n } from '@/stores/i18n.svelte'

  interface Props {
    isOpen: boolean
    onClose?: () => void
    onSelect?: (password: string) => void
  }

  const { isOpen, onClose, onSelect }: Props = $props()

  function handlePasswordSelect(password: string) {
    onSelect?.(password)
    onClose?.()
  }
</script>

<Modal
  {isOpen}
  title={i18n.t('passwordGenerator.title')}
  {onClose}
  boxClass='max-w-lg'
>
  {#snippet children()}
    <PasswordGenerator
      onSelect={handlePasswordSelect}
    />
  {/snippet}
</Modal>
