export interface Notification {
  id: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number // Auto dismiss time in milliseconds, 0 for no auto dismiss
}

export type NotificationType = Notification['type']
