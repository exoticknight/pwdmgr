// 通知项配置选项
export interface NotificationOptions {
  message: string
  type?: NotificationType
  duration?: number // Auto dismiss time in milliseconds, 0 for no auto dismiss
}

// 通知项数据结构
export interface Notification {
  id: string
  message: string
  type: NotificationType
  duration: number
}

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

// 通知状态（UI层使用）
export interface NotificationState {
  notifications: Notification[]
}

// 通知控制接口（业务层调用 + UI框架实现）
export interface NotificationControl {
  /**
   * 获取当前通知状态（只读）
   */
  readonly state: Readonly<NotificationState>

  /**
   * 显示通知
   * @param options 通知选项
   * @returns 通知ID
   */
  show: (options: NotificationOptions) => string

  /**
   * 显示成功通知
   * @param message 消息内容
   * @param duration 持续时间，默认3000ms
   * @returns 通知ID
   */
  success: (message: string, duration?: number) => string

  /**
   * 显示错误通知
   * @param message 消息内容
   * @param duration 持续时间，默认5000ms
   * @returns 通知ID
   */
  error: (message: string, duration?: number) => string

  /**
   * 显示警告通知
   * @param message 消息内容
   * @param duration 持续时间，默认4000ms
   * @returns 通知ID
   */
  warning: (message: string, duration?: number) => string

  /**
   * 显示信息通知
   * @param message 消息内容
   * @param duration 持续时间，默认3000ms
   * @returns 通知ID
   */
  info: (message: string, duration?: number) => string

  /**
   * 关闭指定通知
   * @param id 通知ID
   */
  dismiss: (id: string) => void

  /**
   * 清除所有通知
   */
  clear: () => void
}
