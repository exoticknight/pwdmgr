<script lang='ts'>
  import { Key } from '@lucide/svelte'
  import App2FAVerifyForm from '@/components/app-2fa-verify-form.svelte'
  import Modal from '@/components/modal.svelte'
  import { auth } from '@/stores/auth.svelte'
  import { i18n } from '@/stores/i18n.svelte'
  import { twoFAGate } from '@/stores/twofa-gate.svelte'
</script>

<Modal
  isOpen={twoFAGate.isOpen}
  title={twoFAGate.isFidoMode ? i18n.t('fido.verifyTitle') : i18n.t('app2fa.verify.title')}
  onClose={() => twoFAGate.resolve(false)}
>
  {#snippet children()}
    {#if twoFAGate.isFidoMode}
      <!-- FIDO 验证模式 -->
      {#if auth.fidoDevicesList.length > 1 && !twoFAGate.fidoDeviceId}
        <!-- 多个设备 - 显示选择 -->
        <div class='space-y-2'>
          <p class='text-sm text-base-content/70 mb-4'>
            {i18n.t('fido.selectDeviceToVerify')}
          </p>
          {#each auth.fidoDevicesList as device}
            <button
              class='btn btn-outline w-full justify-start'
              onclick={() => twoFAGate.selectFidoDevice(device.id)}
            >
              <Key size={18} />
              {device.name}
            </button>
          {/each}
        </div>
      {:else}
        <!-- 单设备或正在验证 -->
        <div class='text-center py-4'>
          <div class='loading loading-spinner loading-lg mb-4'></div>
          <p>{i18n.t('fido.authenticating')}</p>
        </div>
      {/if}
    {:else if twoFAGate.provider}
      <!-- TOTP 验证模式 -->
      <App2FAVerifyForm
        onSuccess={() => twoFAGate.resolve(true)}
        provider={twoFAGate.provider}
      />
    {/if}
  {/snippet}
</Modal>
