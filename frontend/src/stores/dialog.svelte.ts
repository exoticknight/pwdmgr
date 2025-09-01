import type { DialogControl, DialogOptions, DialogResult, DialogState } from '@/types/dialog'

class Dialog implements DialogControl {
  #dialogState = $state<DialogState>({
    isOpen: false,
    options: null,
    resolve: null,
  })

  get state(): Readonly<DialogState> {
    return this.#dialogState
  }

  async alert(message: string, title?: string): Promise<void> {
    await this.show({
      type: 'info',
      title,
      message,
    })
  }

  async confirm(message: string, title?: string): Promise<boolean> {
    const result = await this.show({
      type: 'confirm',
      title,
      message,
    })
    return result.confirmed
  }

  async prompt(message: string, defaultValue?: string, title?: string): Promise<string | null> {
    const result = await this.show({
      type: 'prompt',
      title,
      message,
      defaultValue,
    })
    return result.confirmed ? (result.value ?? '') : null
  }

  async show(options: DialogOptions): Promise<DialogResult> {
    return new Promise((resolve) => {
      $effect.root(() => {
        this.#dialogState.isOpen = true
        this.#dialogState.options = options
        this.#dialogState.resolve = resolve
      })
    })
  }

  close(result: DialogResult): void {
    const currentResolve = this.#dialogState.resolve

    this.#dialogState.isOpen = false
    this.#dialogState.options = null
    this.#dialogState.resolve = null

    if (currentResolve) {
      currentResolve(result)
    }
  }
}

export const dialog = new Dialog()
