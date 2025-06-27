import type { Notification, NotificationType } from '../types/notification'

class NotificationStore {
  private notifications = $state<Notification[]>([])
  private timers = new Map<string, number>()

  get all(): Notification[] {
    return this.notifications
  }

  show(message: string, type: NotificationType = 'info', duration: number = 5000): string {
    const id = crypto.randomUUID()
    const notification: Notification = {
      id,
      message,
      type,
      duration,
    }

    this.notifications.push(notification)

    // Auto dismiss if duration is set
    if (duration > 0) {
      const timer = setTimeout(() => {
        this.dismiss(id)
      }, duration)
      this.timers.set(id, timer)
    }

    return id
  }

  success(message: string, duration: number = 3000): string {
    return this.show(message, 'success', duration)
  }

  error(message: string, duration: number = 5000): string {
    return this.show(message, 'error', duration)
  }

  warning(message: string, duration: number = 4000): string {
    return this.show(message, 'warning', duration)
  }

  info(message: string, duration: number = 3000): string {
    return this.show(message, 'info', duration)
  }

  dismiss(id: string): void {
    // Clear timer if exists
    const timer = this.timers.get(id)
    if (timer !== undefined) {
      clearTimeout(timer)
      this.timers.delete(id)
    }

    // Remove notification
    const index = this.notifications.findIndex(n => n.id === id)
    if (index >= 0) {
      this.notifications.splice(index, 1)
    }
  }

  clear(): void {
    // Clear all timers
    this.timers.forEach(timer => clearTimeout(timer))
    this.timers.clear()

    // Clear all notifications
    this.notifications.splice(0)
  }
}

export const notificationStore = new NotificationStore()
