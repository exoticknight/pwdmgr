<script lang='ts'>
  import { FileLock } from '@lucide/svelte'
  import { onDestroy, onMount } from 'svelte'
  import { OnFileDrop, OnFileDropOff } from '../../wailsjs/runtime/runtime'
  import { PASSWORD_FILE_CONFIG } from '../config/file-config'
  import { t } from '../hooks/use-translation'

  interface Props {
    onFileSelect: (event: Event) => void
    onFileDrop: (files: string[]) => void
  }

  const { onFileSelect, onFileDrop }: Props = $props()

  let isDragOver = $state(false)

  onMount(() => {
    // 使用Wails原生拖放API
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
  class='border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300'
  class:border-blue-500={isDragOver}
  class:bg-blue-50={isDragOver}
  class:border-gray-300={!isDragOver}
  class:hover:border-gray-400={!isDragOver}
  ondragenter={handleDragEnter}
  ondragleave={handleDragLeave}
  ondragover={handleDragOver}
  style='--wails-drop-target: drop;'
>
  <div class='mb-4'>
    <FileLock class='mx-auto h-12 w-12 text-gray-400' />
  </div>
  <p class='text-lg font-medium text-gray-700 mb-2'>{t('dropzone.title')}</p>
  <p class='text-sm text-gray-500 mb-4'>{t('dropzone.subtitle')}</p>
  <label class='btn btn-outline btn-primary cursor-pointer'>
    <input
      type='file'
      class='hidden'
      accept={PASSWORD_FILE_CONFIG.acceptAttribute}
      onchange={onFileSelect}
    />
    {t('dropzone.selectButton')}
  </label>
</div>
