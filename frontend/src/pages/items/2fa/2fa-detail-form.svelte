<script lang='ts'>
  import type { TwoFactorAuthData } from '@/types/data'
  import { Copy, ExternalLink } from '@lucide/svelte'
  import { BrowserOpenURL } from '@/../wailsjs/runtime/runtime'
  import BrandIcon from '@/components/brand-icon.svelte'
  import TotpDisplay from '@/components/totp-display.svelte'

  interface Props {
    entry: TwoFactorAuthData
    onCopyToClipboard: (text: string) => void
  }

  const { entry, onCopyToClipboard }: Props = $props()

  function handleOpenUrl() {
    if (entry.serviceUrl) {
      BrowserOpenURL(entry.serviceUrl)
    }
  }

</script>

<div class='2fa-detail-form space-y-6'>
  <!-- TOTP显示 -->
  <div class='card bg-base-200 shadow-sm'>
    <TotpDisplay
      {entry}
      showNextCode={true}
      autoRefresh={true}
    />
  </div>

  <!-- 基本信息 -->
  <div class='card bg-base-200 shadow-sm'>
    <div class='card-body p-4'>
      <h3 class='card-title text-lg mb-4'>Account Information</h3>

      <div class='space-y-3'>
        <!-- 服务提供商 -->
        <div class='flex items-center justify-between'>
          <span class='text-base-content/70'>Service Provider</span>
          <div class='flex items-center gap-2'>
            <BrandIcon name={entry.issuer} size='1.5rem' />
            <span class='font-medium'>{entry.issuer}</span>
            <button
              class='btn btn-ghost btn-xs'
              onclick={() => onCopyToClipboard(entry.issuer)}
            >
              <Copy class='w-3 h-3' />
            </button>
          </div>
        </div>

        <!-- 账户名 -->
        <div class='flex items-center justify-between'>
          <span class='text-base-content/70'>Account Name</span>
          <div class='flex items-center gap-2'>
            <span class='font-mono'>{entry.username}</span>
            <button
              class='btn btn-ghost btn-xs'
              onclick={() => onCopyToClipboard(entry.username)}
            >
              <Copy class='w-3 h-3' />
            </button>
          </div>
        </div>

        <!-- 网站URL -->
        {#if entry.serviceUrl}
          <div class='flex items-center justify-between'>
            <span class='text-base-content/70'>Website</span>
            <div class='flex items-center gap-2'>
              <a
                href={entry.serviceUrl}
                target='_blank'
                rel='noopener noreferrer'
                class='link link-primary truncate max-w-48'
              >
                {entry.serviceUrl}
              </a>
              <button
                class='btn btn-ghost btn-xs'
                onclick={() => onCopyToClipboard(entry.serviceUrl || '')}
                title='Copy URL'
              >
                <Copy class='w-3 h-3' />
              </button>
              <button
                class='btn btn-ghost btn-xs'
                onclick={handleOpenUrl}
                title='Open in browser'
              >
                <ExternalLink class='w-3 h-3' />
              </button>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>

  <!-- 技术参数 -->
  <div class='card bg-base-200 shadow-sm'>
    <div class='card-body p-4'>
      <h3 class='card-title text-lg mb-4'>Technical Parameters</h3>

      <div class='grid grid-cols-2 gap-4'>
        <div class='flex flex-col'>
          <span class='text-base-content/70 text-sm'>Algorithm</span>
          <span class='font-mono font-medium'>{entry.algorithm}</span>
        </div>

        <div class='flex flex-col'>
          <span class='text-base-content/70 text-sm'>Digits</span>
          <span class='font-mono font-medium'>{entry.digits}</span>
        </div>

        <div class='flex flex-col'>
          <span class='text-base-content/70 text-sm'>Period</span>
          <span class='font-mono font-medium'>{entry.period}s</span>
        </div>

        <div class='flex flex-col'>
          <span class='text-base-content/70 text-sm'>Type</span>
          <span class='font-mono font-medium'>TOTP</span>
        </div>
      </div>
    </div>
  </div>

  <!-- 备注 -->
  {#if entry.notes}
    <div class='card bg-base-200 shadow-sm'>
      <div class='card-body p-4'>
        <h3 class='card-title text-lg mb-4'>Notes</h3>
        <p class='text-base-content whitespace-pre-wrap'>{entry.notes}</p>
      </div>
    </div>
  {/if}
</div>
