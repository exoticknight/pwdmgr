<script lang='ts'>
  import type { Notification } from '../types/notification'
  import { AlertCircle, AlertTriangle, CheckCircle, Info } from '@lucide/svelte'
  import { notificationStore } from '../stores/notification.svelte'

  const notifications: Notification[] = $derived(notificationStore.all)

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
        {#if notification.type === 'success'}
          <CheckCircle class='w-5 h-5' />
        {:else if notification.type === 'error'}
          <AlertCircle class='w-5 h-5' />
        {:else if notification.type === 'warning'}
          <AlertTriangle class='w-5 h-5' />
        {:else}
          <Info class='w-5 h-5' />
        {/if}
        <span class='text-white'>{notification.message}</span>
      </div>
    {/each}
  </div>
{/if}
