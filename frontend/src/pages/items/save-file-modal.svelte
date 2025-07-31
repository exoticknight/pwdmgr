<script lang='ts'>
  import { Save, X } from '@lucide/svelte'
  import Modal from '@/components/modal.svelte'
  import WailsFileSelect from '@/components/wails-file-select.svelte'
  import i18next from '@/i18n'

  interface Props {
    isOpen: boolean
    onSave: (filePaths: string[]) => void
    onCancel: () => void
  }

  const { isOpen, onSave, onCancel }: Props = $props()
</script>

<Modal
  {isOpen}
  title={i18next.t('dialogs.savePasswordFile')}
  onClose={onCancel}
  showCloseButton={false}
>
  {#snippet children()}
    <WailsFileSelect
      class='border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer transition-colors hover:border-blue-500'
      title={i18next.t('dialogs.savePasswordFile')}
      defaultFilename='passwords.pwd'
      filters={[
        { displayName: i18next.t('landing.passwordFiles'), pattern: '*.pwd' },
      ]}
      canCreateDirs={true}
      mode='save'
      enableDrop={false}
      onSelect={onSave}
    >
      {#snippet children({ mode: _mode })}
        <div class='flex justify-center mb-4'>
          <Save class='w-8 h-8 text-base-content/50' />
        </div>
        <p class='text-center text-gray-600'>
          {i18next.t('dialogs.saveLocation')}
        </p>
      {/snippet}
    </WailsFileSelect>
  {/snippet}

  {#snippet actions()}
    <button
      class='btn btn-ghost'
      onclick={onCancel}
    >
      <X class='w-4 h-4 mr-2' />
      {i18next.t('dialogs.cancel')}
    </button>
  {/snippet}
</Modal>
