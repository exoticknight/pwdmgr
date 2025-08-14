<script lang='ts'>
  import type { TOTPResult } from '../types/2fa'
  import type { TwoFactorAuthData } from '../types/data'
  import { Copy, Eye, EyeOff } from '@lucide/svelte'
  import { onDestroy, onMount } from 'svelte'
  import { Client2FAService } from '../services/2fa-client'

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
  let showCode = $state(true)
  let copyText = $state('Copy')

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
        copyText = 'Copy'
      }, 2000)
    }
    catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  // 切换显示/隐藏验证码
  function toggleShowCode() {
    showCode = !showCode
  }

  // 格式化验证码显示
  function formatCode(code: string): string {
    if (!showCode) {
      return '•'.repeat(code.length)
    }

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

  // 计算进度条样式
  function getProgressStyle(progress: number): string {
    const percentage = Math.round(progress * 100)
    const hue = Math.round((1 - progress) * 120) // 从绿色(120)到红色(0)
    return `--progress: ${percentage}%; --hue: ${hue}`
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

<div class='totp-display flex items-center gap-4 p-4 border rounded-lg'>
  <!-- 服务图标和信息 -->
  <div class='flex-1'>
    <div class='flex items-center gap-3'>
      <div class='w-10 h-10 rounded-full bg-primary text-primary-content flex items-center justify-center text-sm font-semibold'>
        {entry.issuer.charAt(0).toUpperCase()}
      </div>
      <div>
        <div class='font-medium text-base-content'>{entry.title}</div>
        <div class='text-sm text-base-content/70'>{entry.accountName}</div>
      </div>
    </div>
  </div>

  <!-- 验证码显示 -->
  <div class='flex flex-col items-center gap-2'>
    {#if totpResult}
      <div class='flex items-center gap-2'>
        <!-- 验证码 -->
        <div class='font-mono text-2xl font-bold text-base-content select-all'>
          {formatCode(totpResult.code)}
        </div>

        <!-- 显示/隐藏按钮 -->
        <button
          class='btn btn-ghost btn-sm btn-circle'
          onclick={toggleShowCode}
          title={showCode ? 'Hide code' : 'Show code'}
        >
          {#if showCode}
            <Eye class='w-4 h-4' />
          {:else}
            <EyeOff class='w-4 h-4' />
          {/if}
        </button>

        <!-- 复制按钮 -->
        <button
          class='btn btn-ghost btn-sm btn-circle'
          onclick={copyCode}
          title={copyText}
        >
          <Copy class='w-4 h-4' />
        </button>
      </div>

      <!-- 倒计时进度条 -->
      <div
        class='radial-progress text-sm'
        style={getProgressStyle(totpResult.progress)}
        role='progressbar'
      >
        {totpResult.remainingTime}s
      </div>

      <!-- 下一个验证码预览 -->
      {#if showNextCode && totpResult.nextCode}
        <div class='text-xs text-base-content/50 font-mono'>
          Next: {formatCode(totpResult.nextCode)}
        </div>
      {/if}
    {:else}
      <div class='text-error text-sm'>Failed to generate code</div>
    {/if}
  </div>
</div>

<style>
  .radial-progress {
    --value: calc(var(--progress, 0) * 1%);
    --size: 3rem;
    --thickness: 3px;
    color: hsl(var(--hue, 120), 70%, 50%);
  }

  .totp-display {
    transition: all 0.2s ease-in-out;
  }

  .totp-display:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border-color: hsl(var(--bc) / 0.2);
  }
</style>
