<script lang='ts'>
  import { Save, X } from '@lucide/svelte'
  import i18next from '../i18n'
  import WailsFileSelect from './wails-file-select.svelte'

  interface Props {
    isOpen: boolean
    onSave: (filePaths: string[]) => void
    onCancel: () => void
  }

  const { isOpen, onSave, onCancel }: Props = $props()
</script>

{#if isOpen}
  <div class='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
    <div class='bg-white rounded-lg p-6 max-w-md w-full mx-4'>
      <h3 class='text-lg font-semibold mb-4'>{i18next.t('dialogs.savePasswordFile')}</h3>
      <WailsFileSelect
        class='border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer transition-colors hover:border-blue-500'
        config={{
          dialog: {
            title: i18next.t('dialogs.savePasswordFile'),
            defaultFilename: 'passwords.pwd',
            filters: [
              { displayName: i18next.t('landing.passwordFiles'), pattern: '*.pwd' },
            ],
            canCreateDirs: true,
          },
          behavior: {
            mode: 'save',
            enableDrop: false,
          },
        }}
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
      <div class='mt-4 flex justify-end gap-2'>
        <button
          class='btn btn-ghost'
          onclick={onCancel}
        >
          <X class='w-4 h-4 mr-2' />
          {i18next.t('dialogs.cancel')}
        </button>
      </div>
    </div>
  </div>
{/if}
