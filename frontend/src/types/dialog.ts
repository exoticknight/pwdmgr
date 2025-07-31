// Dialog configuration options
export interface DialogOptions {
  title?: string
  message: string
  type?: 'info' | 'warning' | 'error' | 'confirm' | 'prompt'
  confirmText?: string
  cancelText?: string
  defaultValue?: string // for prompt
  timeout?: number // Auto close time (milliseconds)
}

// Dialog operation result
export interface DialogResult {
  confirmed: boolean
  value?: string // for prompt
}

// Dialog state (used by UI layer)
export interface DialogState {
  isOpen: boolean
  options: DialogOptions | null
  resolve: ((result: DialogResult) => void) | null
}

// Dialog control interface (called by business layer + implemented by UI framework)
export interface DialogControl {
  /**
   * Get current dialog state (readonly)
   */
  readonly state: Readonly<DialogState>

  /**
   * Show info dialog
   * @param message Message content
   * @param title Optional title
   * @returns Promise<void>
   */
  alert: (message: string, title?: string) => Promise<void>

  /**
   * Show confirm dialog
   * @param message Confirm message
   * @param title Optional title
   * @returns Promise<boolean> Whether user confirmed
   */
  confirm: (message: string, title?: string) => Promise<boolean>

  /**
   * Show input dialog
   * @param message Prompt message
   * @param defaultValue Default input value
   * @param title Optional title
   * @returns Promise<string | null> User input value, null for cancel
   */
  prompt: (message: string, defaultValue?: string, title?: string) => Promise<string | null>

  /**
   * Generic dialog show method
   * @param options Dialog options
   * @returns Promise<DialogResult>
   */
  show: (options: DialogOptions) => Promise<DialogResult>

  /**
   * Close dialog
   * @param result Dialog result
   */
  close: (result: DialogResult) => void
}
