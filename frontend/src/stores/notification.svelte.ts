import type {
  NotificationControl,
  Notification as NotificationItem,
  NotificationOptions,
  NotificationState,
  NotificationType,
} from '@/types/notification'

class Notification implements NotificationControl {
  private notificationState = $state<NotificationState>({
    notifications: [],
  })

  private timers = new Map<string, number>()

  // 使用 getter 暴露只读状态
  get state(): Readonly<NotificationState> {
    return this.notificationState
  }

  // 兼容性getter（保持向后兼容）
  get all(): NotificationItem[] {
    return this.notificationState.notifications
  }

  show(options: NotificationOptions): string
  show(message: string, type?: NotificationType, duration?: number): string
  show(
    optionsOrMessage: NotificationOptions | string,
    type: NotificationType = 'info',
    duration: number = 5000,
  ): string {
    // 处理重载参数
    let options: NotificationOptions
    if (typeof optionsOrMessage === 'string') {
      options = {
        message: optionsOrMessage,
        type,
        duration,
      }
    }
    else {
      options = optionsOrMessage
    }

    const id = crypto.randomUUID()
    const notification: NotificationItem = {
      id,
      message: options.message,
      type: options.type ?? 'info',
      duration: options.duration ?? 5000,
    }

    this.notificationState.notifications.push(notification)

    // Auto dismiss if duration is set
    if (notification.duration > 0) {
      const timer = setTimeout(() => {
        this.dismiss(id)
      }, notification.duration) as unknown as number
      this.timers.set(id, timer)
    }

    return id
  }

  success(message: string, duration: number = 3000): string {
    return this.show({ message, type: 'success', duration })
  }

  error(message: string, duration: number = 5000): string {
    return this.show({ message, type: 'error', duration })
  }

  warning(message: string, duration: number = 4000): string {
    return this.show({ message, type: 'warning', duration })
  }

  info(message: string, duration: number = 3000): string {
    return this.show({ message, type: 'info', duration })
  }

  dismiss(id: string): void {
    // Clear timer if exists
    const timer = this.timers.get(id)
    if (timer !== undefined) {
      clearTimeout(timer)
      this.timers.delete(id)
    }

    // Remove notification
    const index = this.notificationState.notifications.findIndex(n => n.id === id)
    if (index >= 0) {
      this.notificationState.notifications.splice(index, 1)
    }
  }

  clear(): void {
    // Clear all timers
    this.timers.forEach(timer => clearTimeout(timer))
    this.timers.clear()

    // Clear all notifications
    this.notificationState.notifications.splice(0)
  }
}

export const notification = new Notification()
