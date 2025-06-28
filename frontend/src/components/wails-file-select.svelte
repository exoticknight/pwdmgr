<script lang='ts'>
  import type { Snippet } from 'svelte'
  import { onDestroy, onMount } from 'svelte'
  import { OpenFileDialog, OpenMultipleFilesDialog, SaveFileDialog } from '../../wailsjs/go/main/FileService'
  import { main } from '../../wailsjs/go/models'
  import { OnFileDrop, OnFileDropOff } from '../../wailsjs/runtime/runtime'

  // File filter type
  interface FileFilter {
    displayName: string
    pattern: string
  }

  // Simplified configuration interface
  interface WailsFileSelectConfig {
    // === Dialog settings ===
    dialog?: {
      title?: string
      defaultDir?: string
      defaultFilename?: string
      filters?: FileFilter[]
      canCreateDirs?: boolean
      showHidden?: boolean
    }

    // === Behavior settings ===
    behavior?: {
      mode?: 'open' | 'save'
      multiple?: boolean
      enableDrop?: boolean
      dropFilter?: (paths: string[]) => string[]
      disabled?: boolean
    }
  }

  interface Props {
    class?: string
    config?: WailsFileSelectConfig
    onSelect: (filePaths: string[]) => void
    children?: Snippet<[{
      isDragOver: boolean
      config: WailsFileSelectConfig
      isDisabled: boolean
      mode: 'open' | 'save'
      enableDrop: boolean
      multiple: boolean
    }]>
  }

  const { class: containerClass, config = {}, onSelect, children }: Props = $props()

  // Default configuration
  const defaults = {
    dialog: {
      title: 'Select Files',
      defaultDir: '',
      defaultFilename: '',
      filters: [{ displayName: 'All Files (*.*)', pattern: '*.*' }],
      canCreateDirs: false,
      showHidden: false,
    },
    behavior: {
      mode: 'open' as const,
      multiple: false,
      enableDrop: true,
      dropFilter: (paths: string[]) => paths,
      disabled: false,
    },
  }

  // Merge configuration
  const cfg = {
    dialog: { ...defaults.dialog, ...config.dialog },
    behavior: { ...defaults.behavior, ...config.behavior },
  }

  let isDragOver = $state(false)

  onMount(() => {
    if (cfg.behavior.enableDrop && !cfg.behavior.disabled) {
      setupFileDrop()
    }
  })

  onDestroy(() => {
    if (cfg.behavior.enableDrop) {
      OnFileDropOff()
    }
  })

  function setupFileDrop() {
    OnFileDrop((x: number, y: number, paths: string[]) => {
      if (cfg.behavior.disabled || cfg.behavior.mode === 'save') {
        return
      }

      const filteredPaths = cfg.behavior.dropFilter!(paths)
      if (filteredPaths.length > 0) {
        onSelect(filteredPaths)
      }
    }, true)
  }

  async function handleSelectFiles() {
    if (cfg.behavior.disabled) {
      return
    }

    try {
      const dialogOptions: main.OpenDialogOptions = new main.OpenDialogOptions({
        title: cfg.dialog.title,
        filters: cfg.dialog.filters!.map(f => new main.FileFilter({
          displayName: f.displayName,
          pattern: f.pattern,
        })),
        defaultDirectory: cfg.dialog.defaultDir,
        defaultFilename: cfg.dialog.defaultFilename,
        canCreateDirectories: cfg.dialog.canCreateDirs,
        resolvesAliases: false, // Simplified configuration, remove uncommon options
        treatPackagesAsDirectories: false,
      })

      let filePaths: string[] = []

      if (cfg.behavior.mode === 'save') {
        const saveOptions: main.SaveDialogOptions = new main.SaveDialogOptions({
          title: cfg.dialog.title,
          filters: cfg.dialog.filters!.map(f => new main.FileFilter({
            displayName: f.displayName,
            pattern: f.pattern,
          })),
          defaultDirectory: cfg.dialog.defaultDir,
          defaultFilename: cfg.dialog.defaultFilename,
          canCreateDirectories: cfg.dialog.canCreateDirs,
          showHiddenFiles: cfg.dialog.showHidden,
          treatPackagesAsDirectories: false,
        })

        const filePath = await SaveFileDialog(saveOptions)
        if (filePath) {
          filePaths = [filePath]
        }
      }
      else if (cfg.behavior.multiple) {
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
    if (cfg.behavior.disabled || !cfg.behavior.enableDrop || cfg.behavior.mode === 'save') {
      return
    }
    event.preventDefault()
    isDragOver = true
  }

  function handleDragLeave(event: DragEvent) {
    if (cfg.behavior.disabled || !cfg.behavior.enableDrop || cfg.behavior.mode === 'save') {
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
    if (cfg.behavior.disabled || !cfg.behavior.enableDrop || cfg.behavior.mode === 'save') {
      return
    }
    event.preventDefault()
  }

  function handleDrop(event: DragEvent) {
    if (cfg.behavior.disabled || !cfg.behavior.enableDrop || cfg.behavior.mode === 'save') {
      return
    }
    event.preventDefault()
    isDragOver = false
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (cfg.behavior.disabled) {
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
  tabindex={cfg.behavior.disabled ? -1 : 0}
  class={containerClass}
  ondragenter={handleDragEnter}
  ondragleave={handleDragLeave}
  ondragover={handleDragOver}
  ondrop={handleDrop}
  onclick={cfg.behavior.disabled ? undefined : handleSelectFiles}
  onkeydown={handleKeyDown}
>
  {#if children}
    {@render children({
      isDragOver,
      config: cfg,
      isDisabled: cfg.behavior.disabled,
      mode: cfg.behavior.mode,
      enableDrop: cfg.behavior.enableDrop,
      multiple: cfg.behavior.multiple,
    })}
  {/if}
</div>
