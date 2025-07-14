import { notification } from '@/stores/notification.svelte'

/**
 * Utility functions for showing notifications
 * These functions provide a convenient way to show notifications throughout the app
 */
export const notifications = {
  /**
   * Show a success notification
   * @param message - The message to display
   * @param duration - Auto dismiss time in milliseconds (default: 3000)
   */
  success: (message: string, duration?: number) => {
    return notification.success(message, duration)
  },

  /**
   * Show an error notification
   * @param message - The message to display
   * @param duration - Auto dismiss time in milliseconds (default: 5000)
   */
  error: (message: string, duration?: number) => {
    return notification.error(message, duration)
  },

  /**
   * Show a warning notification
   * @param message - The message to display
   * @param duration - Auto dismiss time in milliseconds (default: 4000)
   */
  warning: (message: string, duration?: number) => {
    return notification.warning(message, duration)
  },

  /**
   * Show an info notification
   * @param message - The message to display
   * @param duration - Auto dismiss time in milliseconds (default: 3000)
   */
  info: (message: string, duration?: number) => {
    return notification.info(message, duration)
  },

  /**
   * Dismiss a specific notification by ID
   * @param id - The notification ID to dismiss
   */
  dismiss: (id: string) => {
    notification.dismiss(id)
  },

  /**
   * Clear all notifications
   */
  clear: () => {
    notification.clear()
  },
}

export default notifications
