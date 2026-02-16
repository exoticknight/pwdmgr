<script lang='ts'>
  import App2FAVerifyForm from '@/components/app-2fa-verify-form.svelte'
  import Modal from '@/components/modal.svelte'
  import { i18n } from '@/stores/i18n.svelte'
  import { twoFAGate } from '@/stores/twofa-gate.svelte'
</script>

<Modal
  isOpen={twoFAGate.isOpen}
  title={i18n.t('app2fa.verify.title')}
  onClose={() => twoFAGate.resolve(false)}
>
  {#snippet children()}
    {#if twoFAGate.provider}
      <App2FAVerifyForm
        onSuccess={() => twoFAGate.resolve(true)}
        provider={twoFAGate.provider}
      />
    {/if}
  {/snippet}
</Modal>
