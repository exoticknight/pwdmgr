<script lang='ts'>
  import type { Notification } from '../types/notification'
  import { notification } from '../stores/notification.svelte'

  const notifications: Notification[] = $derived(notification.all)

  function getAlertClass(type: string): string {
    switch (type) {
      case 'success':
        return 'alert-success'
      case 'error':
        return 'alert-error'
      case 'warning':
        return 'alert-warning'
      case 'info':
      default:
        return 'alert-info'
    }
  }
</script>

<!-- Toast container -->
{#if notifications.length > 0}
  <div class='toast toast-bottom toast-end z-50'>
    {#each notifications as notification (notification.id)}
      <div class='alert {getAlertClass(notification.type)} shadow-lg'>
        <span class='text-white'>{notification.message}</span>
      </div>
    {/each}
  </div>
{/if}
