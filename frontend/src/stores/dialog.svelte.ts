import type { DialogControl, DialogOptions, DialogResult, DialogState } from '@/types/dialog'

class Dialog implements DialogControl {
  private dialogState = $state<DialogState>({
    isOpen: false,
    options: null,
    resolve: null,
  })

  // 使用 getter 暴露只读状态
  get state(): Readonly<DialogState> {
    return this.dialogState
  }

  // 显示信息对话框
  async alert(message: string, title?: string): Promise<void> {
    await this.show({
      type: 'info',
      title,
      message,
    })
  }

  // 显示确认对话框
  async confirm(message: string, title?: string): Promise<boolean> {
    const result = await this.show({
      type: 'confirm',
      title,
      message,
    })
    return result.confirmed
  }

  // 显示输入对话框
  async prompt(message: string, defaultValue?: string, title?: string): Promise<string | null> {
    const result = await this.show({
      type: 'prompt',
      title,
      message,
      defaultValue,
    })
    return result.confirmed ? (result.value ?? '') : null
  }

  // 通用显示方法
  async show(options: DialogOptions): Promise<DialogResult> {
    return new Promise((resolve) => {
      // 使用批量更新以提高性能
      $effect.root(() => {
        this.dialogState.isOpen = true
        this.dialogState.options = options
        this.dialogState.resolve = resolve
      })
    })
  }

  // 关闭对话框
  close(result: DialogResult): void {
    const currentResolve = this.dialogState.resolve

    // 先重置状态
    this.dialogState.isOpen = false
    this.dialogState.options = null
    this.dialogState.resolve = null

    // 然后调用 resolve
    if (currentResolve) {
      currentResolve(result)
    }
  }
}

export const dialog = new Dialog()
