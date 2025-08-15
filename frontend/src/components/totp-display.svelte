<script lang='ts'>
  import type { TOTPResult } from '@/types/2fa'
  import type { TwoFactorAuthData } from '@/types/data'
  import { onDestroy, onMount } from 'svelte'
  import { Client2FAService } from '@/services/2fa-client'
  import Countdown from './countdown.svelte'

  interface Props {
    entry: TwoFactorAuthData
    showNextCode?: boolean
    autoRefresh?: boolean
  }

  const {
    entry,
    showNextCode = false,
    autoRefresh = true,
  }: Props = $props()

  let totpResult = $state<TOTPResult | null>(null)
  let intervalId: number | null = null
  let copyText = $state('Click to Copy')

  // 生成验证码
  function generateCode() {
    try {
      totpResult = Client2FAService.generateCurrentTOTP(entry)
    }
    catch (error) {
      console.error('Failed to generate TOTP code:', error)
      totpResult = null
    }
  }

  // 复制验证码到剪贴板
  async function copyCode() {
    if (!totpResult?.code) {
      return
    }

    try {
      await navigator.clipboard.writeText(totpResult.code)
      copyText = 'Copied!'
      setTimeout(() => {
        copyText = 'Click to Copy'
      }, 2000)
    }
    catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  // 格式化验证码显示
  function formatCode(code: string): string {
    // 如果是6位数，显示为 123 456
    // 如果是8位数，显示为 1234 5678
    if (code.length === 6) {
      return `${code.slice(0, 3)} ${code.slice(3)}`
    }
    else if (code.length === 8) {
      return `${code.slice(0, 4)} ${code.slice(4)}`
    }
    return code
  }

  onMount(() => {
    generateCode()

    if (autoRefresh) {
      // 每秒更新一次
      intervalId = window.setInterval(() => {
        generateCode()
      }, 1000)
    }
  })

  onDestroy(() => {
    if (intervalId) {
      clearInterval(intervalId)
    }
  })
</script>

<div class='totp-display flex flex-row items-center justify-between p-4'>
  {#if totpResult}
    <div class='font-mono font-bold text-base-content'>
      <button
        type='button'
        class='text-4xl tooltip tooltip-right cursor-pointer'
        data-tip={copyText}
        onclick={copyCode}
      >
        {formatCode(totpResult.code)}
      </button>

      <!-- 下一个验证码预览 -->
      {#if showNextCode && totpResult.nextCode}
        <div class='text-xs text-base-content/50'>
          Next: {formatCode(totpResult.nextCode)}
        </div>
      {/if}
    </div>

    <Countdown
      remainingTime={totpResult.remainingTime}
      totalTime={entry.period}
    />

  {:else}
    <div class='text-error text-sm'>Failed to generate code</div>
  {/if}
</div>

<style>
</style>
