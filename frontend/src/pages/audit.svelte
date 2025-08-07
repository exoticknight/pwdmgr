<script lang='ts'>
  import { onMount } from 'svelte'
  import { audit } from '@/stores/audit.svelte'

  import Issues from './audit/issues.svelte'
  import Overview from './audit/overview.svelte'
  import Statistics from './audit/statistics.svelte'

  onMount(() => {
    audit.analyze()
  })
</script>

<div class='w-full h-full p-6 overflow-y-auto'>
  <div class='flex justify-between items-center mb-6'>
    <button
      class='btn btn-primary'
      class:loading={audit.isAnalyzing}
      onclick={() => audit.analyze()}
      disabled={audit.isAnalyzing}
    >
      {audit.isAnalyzing ? '分析中...' : '刷新分析'}
    </button>
  </div>

  <!-- Tab Navigation -->
  <div class='tabs tabs-lift w-full'>
    <label class='tab'>
      <input type='radio' name='security_tabs' checked />
      概览
    </label>
    <div class='tab-content bg-base-100 border-base-300 p-6'>
      <Overview securityIssues={audit.securityIssues} isAnalyzing={audit.isAnalyzing} />
    </div>

    <label class='tab'>
      <input type='radio' name='security_tabs' />
      安全问题
    </label>
    <div class='tab-content bg-base-100 border-base-300 p-6'>
      <Issues securityIssues={audit.securityIssues} isAnalyzing={audit.isAnalyzing} />
    </div>

    <label class='tab'>
      <input type='radio' name='security_tabs' />
      数据统计
    </label>
    <div class='tab-content bg-base-100 border-base-300 p-6'>
      <Statistics />
    </div>
  </div>
</div>
