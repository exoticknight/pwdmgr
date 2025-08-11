<script lang='ts'>
  import { onMount } from 'svelte'
  import AutoRefresh from '@/components/auto-refresh.svelte'
  import { audit } from '@/stores/audit.svelte'

  import { i18n } from '@/stores/i18n.svelte'
  import Issues from './audit/issues.svelte'
  import Overview from './audit/overview.svelte'
  import Statistics from './audit/statistics.svelte'

  // 本地loading状态，确保至少显示1秒
  let isUILoading = $state(false)

  onMount(() => {
    // 只在第一次加载且还未分析过时自动触发分析
    if (!audit.hasAnalyzed) {
      // 首次分析不需要拖长时间
      audit.analyze()
    }
  })

  // 处理手动分析，确保loading至少显示1秒
  async function handleAnalyze() {
    isUILoading = true

    await Promise.all([
      Promise.resolve(audit.analyze()),
      new Promise(resolve => setTimeout(resolve, 1000)),
    ])

    isUILoading = false
  }
</script>

<div class='w-full h-full p-6 grid grid-rows-[auto_1fr]'>
  <div class='flex justify-end items-center gap-4'>
    <!-- 上次刷新时间 -->
    {#if audit.lastAnalyzed && !audit.isAnalyzing && !isUILoading}
      <AutoRefresh interval={60_000} initial={false} refresh={() => i18n.formatDistanceToNow(audit.lastAnalyzed!.toISOString())}>
        {#snippet children(result)}
          <span class='text-sm text-gray-500'>
            上次刷新: {result}
          </span>
        {/snippet}
      </AutoRefresh>
    {/if}

    <button
      class='btn btn-primary'
      onclick={handleAnalyze}
      disabled={audit.isAnalyzing || isUILoading}
    >
      {(audit.isAnalyzing || isUILoading) ? '分析中...' : '刷新分析'}
    </button>
  </div>

  {#if audit.isAnalyzing || isUILoading}
    <!-- 分析中的loading效果 -->
    <div class='flex flex-col items-center justify-center h-96 space-y-4'>
      <div class='loading loading-spinner loading-lg'></div>
      <p class='text-lg text-gray-600'>分析中...</p>
      <p class='text-sm text-gray-500'>这可能需要几秒钟时间</p>
    </div>
  {:else}
    <!-- Tab Navigation -->
    <div class='min-h-0'>
      <div class='tabs tabs-lift h-full'>
        <label class='tab'>
          <input type='radio' name='security_tabs' checked />
          概览
        </label>
        <div class='tab-content overflow-y-auto bg-base-100 border-base-300 p-6'>
          <Overview />
        </div>

        <label class='tab'>
          <input type='radio' name='security_tabs' />
          安全问题
        </label>
        <div class='tab-content overflow-y-auto bg-base-100 border-base-300 p-6'>
          <Issues />
        </div>

        <label class='tab'>
          <input type='radio' name='security_tabs' />
          数据统计
        </label>
        <div class='tab-content overflow-y-auto bg-base-100 border-base-300 p-6'>
          <Statistics />
        </div>
      </div>
    </div>
  {/if}
</div>
