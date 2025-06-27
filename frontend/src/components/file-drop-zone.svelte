<script lang='ts'>
  import { FileLock } from '@lucide/svelte'
  import { onDestroy, onMount } from 'svelte'
  import { OnFileDrop, OnFileDropOff } from '../../wailsjs/runtime/runtime'
  import { PASSWORD_FILE_CONFIG } from '../config/file-config'
  import i18next from '../i18n'

  interface Props {
    onFileSelect: (event: Event) => void
    onFileDrop: (files: string[]) => void
  }

  const { onFileSelect, onFileDrop }: Props = $props()

  let isDragOver = $state(false)

  onMount(() => {
    // Use Wails native drag and drop API
    OnFileDrop((x, y, paths) => {
      isDragOver = false
      onFileDrop(paths)
    }, true)
  })

  onDestroy(() => {
    OnFileDropOff()
  })

  function handleDragEnter() {
    isDragOver = true
  }

  function handleDragLeave() {
    isDragOver = false
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault()
  }
</script>

<div
  role='button'
  tabindex='0'
  class='border-2 border-dashed border-base-300 rounded-lg p-8 text-center transition-colors hover:border-base-content/20'
  class:border-primary={isDragOver}
  class:bg-base-200={isDragOver}
  ondragenter={handleDragEnter}
  ondragleave={handleDragLeave}
  ondragover={handleDragOver}
  style='--wails-drop-target: drop;'
>
  <div class='mb-4'>
    <FileLock class='mx-auto h-10 w-10 text-base-content/50' />
  </div>
  <p class='font-medium mb-2'>{i18next.t('dropzone.title')}</p>
  <p class='text-sm text-base-content/70 mb-4'>{i18next.t('dropzone.subtitle')}</p>
  <label class='btn btn-outline btn-primary btn-sm cursor-pointer'>
    <input
      type='file'
      class='hidden'
      accept={PASSWORD_FILE_CONFIG.acceptAttribute}
      onchange={onFileSelect}
    />
    {i18next.t('dropzone.selectButton')}
  </label>
</div>
