<script lang='ts'>
  import type { FileSelection } from '../types/file'
  import { FileLock } from '@lucide/svelte'
  import i18next from '../i18n'

  interface Props {
    onFileSelected: (selection: FileSelection) => void
    disabled?: boolean
    acceptAttribute?: string
    validateFile?: (fileName: string) => { isValid: boolean, error?: string }
  }

  const {
    onFileSelected,
    disabled = false,
    acceptAttribute = '*',
    validateFile = () => ({ isValid: true }),
  }: Props = $props()

  let isDragOver = $state(false)
  let fileInputRef: HTMLInputElement | undefined

  function handleFileSelection(file: File) {
    const validation = validateFile(file.name)

    const selection: FileSelection = {
      file,
      fileName: file.name,
      isValid: validation.isValid,
      error: validation.error,
    }

    onFileSelected(selection)
  }

  function handleDragEnter(event: DragEvent) {
    if (!disabled) {
      event.preventDefault()
      isDragOver = true
    }
  }

  function handleDragLeave(event: DragEvent) {
    event.preventDefault()
    isDragOver = false
  }

  function handleDragOver(event: DragEvent) {
    if (!disabled) {
      event.preventDefault()
    }
  }

  function handleDrop(event: DragEvent) {
    if (disabled) {
      return
    }

    event.preventDefault()
    isDragOver = false

    const files = event.dataTransfer?.files
    if (files && files.length > 0) {
      handleFileSelection(files[0])
    }
  }

  function handleClick() {
    if (!disabled && fileInputRef) {
      fileInputRef.click()
    }
  }
</script>

<div
  role='button'
  tabindex='0'
  class='border-2 border-dashed border-base-300 rounded-lg p-8 text-center transition-colors hover:border-base-content/20'
  class:border-primary={isDragOver}
  class:bg-base-200={isDragOver}
  class:opacity-50={disabled}
  class:cursor-not-allowed={disabled}
  ondragenter={handleDragEnter}
  ondragleave={handleDragLeave}
  ondragover={handleDragOver}
  ondrop={handleDrop}
  onclick={handleClick}
  onkeydown={(e) => {
    if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      handleClick()
    }
  }}
>
  <div class='mb-4'>
    <FileLock class='mx-auto h-10 w-10 text-base-content/50' />
  </div>
  <p class='font-medium mb-2'>{i18next.t('dropzone.title')}</p>
  <p class='text-sm text-base-content/70 mb-4'>{i18next.t('dropzone.subtitle')}</p>
  <div class='btn btn-outline btn-primary btn-sm' class:btn-disabled={disabled}>
    <input
      bind:this={fileInputRef}
      type='file'
      class='hidden'
      accept={acceptAttribute}
      onchange={(e) => {
        const input = e.target as HTMLInputElement
        const files = input.files
        if (files && files.length > 0) {
          handleFileSelection(files[0])
        }
      }}
      {disabled}
    />
    {i18next.t('dropzone.selectButton')}
  </div>
</div>
