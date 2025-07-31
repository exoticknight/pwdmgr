import type { DialogControl, DialogOptions, DialogResult, DialogState } from '@/types/dialog'

class Dialog implements DialogControl {
  private dialogState = $state<DialogState>({
    isOpen: false,
    options: null,
    resolve: null,
  })

  // Use getter to expose readonly state
  get state(): Readonly<DialogState> {
    return this.dialogState
  }

  // Show info dialog
  async alert(message: string, title?: string): Promise<void> {
    await this.show({
      type: 'info',
      title,
      message,
    })
  }

  // Show confirm dialog
  async confirm(message: string, title?: string): Promise<boolean> {
    const result = await this.show({
      type: 'confirm',
      title,
      message,
    })
    return result.confirmed
  }

  // Show input dialog
  async prompt(message: string, defaultValue?: string, title?: string): Promise<string | null> {
    const result = await this.show({
      type: 'prompt',
      title,
      message,
      defaultValue,
    })
    return result.confirmed ? (result.value ?? '') : null
  }

  // Generic show method
  async show(options: DialogOptions): Promise<DialogResult> {
    return new Promise((resolve) => {
      // Use batch update for better performance
      $effect.root(() => {
        this.dialogState.isOpen = true
        this.dialogState.options = options
        this.dialogState.resolve = resolve
      })
    })
  }

  // Close dialog
  close(result: DialogResult): void {
    const currentResolve = this.dialogState.resolve

    // Reset state first
    this.dialogState.isOpen = false
    this.dialogState.options = null
    this.dialogState.resolve = null

    // Then call resolve
    if (currentResolve) {
      currentResolve(result)
    }
  }
}

export const dialog = new Dialog()
