// Notification configuration options
export interface NotificationOptions {
  message: string
  type?: NotificationType
  duration?: number // Auto dismiss time in milliseconds, 0 for no auto dismiss
}

// Notification data structure
export interface Notification {
  id: string
  message: string
  type: NotificationType
  duration: number
}

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

// Notification state (used by UI layer)
export interface NotificationState {
  notifications: Notification[]
}

// Notification control interface (called by business layer + implemented by UI framework)
export interface NotificationControl {
  /**
   * Get current notification state (readonly)
   */
  readonly state: Readonly<NotificationState>

  /**
   * Show notification
   * @param options Notification options
   * @returns Notification ID
   */
  show: (options: NotificationOptions) => string

  /**
   * Show success notification
   * @param message Message content
   * @param duration Duration, default 3000ms
   * @returns Notification ID
   */
  success: (message: string, duration?: number) => string

  /**
   * Show error notification
   * @param message Message content
   * @param duration Duration, default 5000ms
   * @returns Notification ID
   */
  error: (message: string, duration?: number) => string

  /**
   * Show warning notification
   * @param message Message content
   * @param duration Duration, default 4000ms
   * @returns Notification ID
   */
  warning: (message: string, duration?: number) => string

  /**
   * Show info notification
   * @param message Message content
   * @param duration Duration, default 3000ms
   * @returns Notification ID
   */
  info: (message: string, duration?: number) => string

  /**
   * Dismiss specific notification
   * @param id Notification ID
   */
  dismiss: (id: string) => void

  /**
   * Clear all notifications
   */
  clear: () => void
}
