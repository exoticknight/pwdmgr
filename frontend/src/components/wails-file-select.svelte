<script lang='ts'>
  import type { Snippet } from 'svelte'
  import { onDestroy, onMount } from 'svelte'
  import { OpenFileDialog, OpenMultipleFilesDialog, SaveFileDialog } from '../../wailsjs/go/internal/FileService'
  import { internal } from '../../wailsjs/go/models'
  import { OnFileDrop, OnFileDropOff } from '../../wailsjs/runtime/runtime'

  // File filter type
  interface FileFilter {
    displayName: string
    pattern: string
  }

  interface Props {
    /** CSS class name for the container element */
    class?: string
    /** Dialog title displayed in the file picker */
    title?: string
    /** Default directory to open when dialog is shown */
    defaultDir?: string
    /** Default filename for save dialogs */
    defaultFilename?: string
    /** File filters to restrict selectable file types */
    filters?: FileFilter[]
    /** Whether users can create new directories in the dialog */
    canCreateDirs?: boolean
    /** Whether to show hidden files in the dialog */
    showHidden?: boolean
    /** Dialog mode: 'open' for file selection, 'save' for file saving */
    mode?: 'open' | 'save'
    /** Whether to allow multiple file selection (only for 'open' mode) */
    multiple?: boolean
    /** Whether to enable drag and drop functionality */
    enableDrop?: boolean
    /** Function to filter dropped file paths before processing */
    dropFilter?: (paths: string[]) => string[]
    /** Whether the component is disabled */
    disabled?: boolean
    /** Callback function called when files are selected */
    onSelect: (filePaths: string[]) => void
    /** Optional child content with access to component state */
    children?: Snippet<[{
      isDragOver: boolean
      isDisabled: boolean
      mode: 'open' | 'save'
      enableDrop: boolean
      multiple: boolean
    }]>
  }

  const {
    class: containerClass,
    title = 'Select Files',
    defaultDir = '',
    defaultFilename = '',
    filters = [{ displayName: 'All Files (*.*)', pattern: '*.*' }],
    canCreateDirs = false,
    showHidden = false,
    mode = 'open',
    multiple = false,
    enableDrop = true,
    dropFilter = (paths: string[]) => paths,
    disabled = false,
    onSelect,
    children,
  }: Props = $props()

  let isDragOver = $state(false)

  onMount(() => {
    if (enableDrop && !disabled) {
      setupFileDrop()
    }
  })

  onDestroy(() => {
    if (enableDrop) {
      OnFileDropOff()
    }
  })

  function setupFileDrop() {
    OnFileDrop((x: number, y: number, paths: string[]) => {
      if (disabled || mode === 'save') {
        return
      }

      const filteredPaths = dropFilter!(paths)
      if (filteredPaths.length > 0) {
        onSelect(filteredPaths)
      }
    }, true)
  }

  async function handleSelectFiles() {
    if (disabled) {
      return
    }

    try {
      const dialogOptions: internal.OpenDialogOptions = new internal.OpenDialogOptions({
        title,
        filters: filters!.map((f: FileFilter) => new internal.FileFilter({
          displayName: f.displayName,
          pattern: f.pattern,
        })),
        defaultDirectory: defaultDir,
        defaultFilename,
        canCreateDirectories: canCreateDirs,
        resolvesAliases: false, // Simplified configuration, remove uncommon options
        treatPackagesAsDirectories: false,
      })

      let filePaths: string[] = []

      if (mode === 'save') {
        const saveOptions: internal.SaveDialogOptions = new internal.SaveDialogOptions({
          title,
          filters: filters!.map((f: FileFilter) => new internal.FileFilter({
            displayName: f.displayName,
            pattern: f.pattern,
          })),
          defaultDirectory: defaultDir,
          defaultFilename,
          canCreateDirectories: canCreateDirs,
          showHiddenFiles: showHidden,
          treatPackagesAsDirectories: false,
        })

        const filePath = await SaveFileDialog(saveOptions)
        if (filePath) {
          filePaths = [filePath]
        }
      }
      else if (multiple) {
        filePaths = await OpenMultipleFilesDialog(dialogOptions)
      }
      else {
        const filePath = await OpenFileDialog(dialogOptions)
        if (filePath) {
          filePaths = [filePath]
        }
      }

      if (filePaths.length > 0) {
        onSelect(filePaths)
      }
    }
    catch (error: unknown) {
      console.error('Failed to open file dialog:', error)
    }
  }

  // Drag and drop event handling
  function handleDragEnter(event: DragEvent) {
    if (disabled || !enableDrop || mode === 'save') {
      return
    }
    event.preventDefault()
    isDragOver = true
  }

  function handleDragLeave(event: DragEvent) {
    if (disabled || !enableDrop || mode === 'save') {
      return
    }
    event.preventDefault()

    const target = event.currentTarget as HTMLElement
    const relatedTarget = event.relatedTarget as HTMLElement

    if (!relatedTarget || !target.contains(relatedTarget)) {
      isDragOver = false
    }
  }

  function handleDragOver(event: DragEvent) {
    if (disabled || !enableDrop || mode === 'save') {
      return
    }
    event.preventDefault()
  }

  function handleDrop(event: DragEvent) {
    if (disabled || !enableDrop || mode === 'save') {
      return
    }
    event.preventDefault()
    isDragOver = false
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (disabled) {
      return
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleSelectFiles()
    }
  }
</script>

<div
  role='button'
  style='--wails-drop-target: drop'
  tabindex={disabled ? -1 : 0}
  class={containerClass}
  ondragenter={handleDragEnter}
  ondragleave={handleDragLeave}
  ondragover={handleDragOver}
  ondrop={handleDrop}
  onclick={disabled ? undefined : handleSelectFiles}
  onkeydown={handleKeyDown}
>
  {#if children}
    {@render children({
      isDragOver,
      isDisabled: disabled,
      mode,
      enableDrop,
      multiple,
    })}
  {/if}
</div>
