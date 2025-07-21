// 对话框配置选项
export interface DialogOptions {
  title?: string
  message: string
  type?: 'info' | 'warning' | 'error' | 'confirm' | 'prompt'
  confirmText?: string
  cancelText?: string
  defaultValue?: string // for prompt
  timeout?: number // 自动关闭时间(毫秒)
}

// 对话框操作结果
export interface DialogResult {
  confirmed: boolean
  value?: string // for prompt
}

// 对话框状态（UI层使用）
export interface DialogState {
  isOpen: boolean
  options: DialogOptions | null
  resolve: ((result: DialogResult) => void) | null
}

// 对话框控制接口（业务层调用 + UI框架实现）
export interface DialogControl {
  /**
   * 获取当前对话框状态（只读）
   */
  readonly state: Readonly<DialogState>

  /**
   * 显示信息对话框
   * @param message 消息内容
   * @param title 可选标题
   * @returns Promise<void>
   */
  alert: (message: string, title?: string) => Promise<void>

  /**
   * 显示确认对话框
   * @param message 确认消息
   * @param title 可选标题
   * @returns Promise<boolean> 用户是否确认
   */
  confirm: (message: string, title?: string) => Promise<boolean>

  /**
   * 显示输入对话框
   * @param message 提示消息
   * @param defaultValue 默认输入值
   * @param title 可选标题
   * @returns Promise<string | null> 用户输入的值，null表示取消
   */
  prompt: (message: string, defaultValue?: string, title?: string) => Promise<string | null>

  /**
   * 通用对话框显示方法
   * @param options 对话框选项
   * @returns Promise<DialogResult>
   */
  show: (options: DialogOptions) => Promise<DialogResult>

  /**
   * 关闭对话框
   * @param result 对话框结果
   */
  close: (result: DialogResult) => void
}
