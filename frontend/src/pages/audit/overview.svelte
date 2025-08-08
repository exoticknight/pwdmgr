<script lang='ts'>
  import type { SecurityIssue } from '@/stores/audit.svelte'

  import { AlertTriangle, CheckCircle, Info, ShieldAlert } from '@lucide/svelte'

  import BarChart from '@/components/bar-chart.svelte'
  import PieChart from '@/components/pie-chart.svelte'
  import RadialChart from '@/components/radial-chart.svelte'
  import { audit } from '@/stores/audit.svelte'

  interface Props {
    securityIssues: SecurityIssue[]
    isAnalyzing: boolean
  }

  const { securityIssues, isAnalyzing }: Props = $props()

  // 获取安全等级的颜色类
  function getScoreColor(score: number): string {
    if (score >= 90) {
      return 'text-success'
    }
    if (score >= 75) {
      return 'text-warning'
    }
    if (score >= 50) {
      return 'text-error'
    }
    return 'text-error'
  }

  // 获取安全等级的徽章类
  function getScoreBadgeColor(level: string): string {
    switch (level) {
      case 'excellent': return 'badge-success'
      case 'good': return 'badge-warning'
      case 'fair': return 'badge-error'
      case 'poor': return 'badge-error'
      default: return 'badge-neutral'
    }
  }

  // 获取安全等级的中文名称
  function getSecurityLevelText(level: string): string {
    switch (level) {
      case 'excellent': return '优秀'
      case 'good': return '良好'
      case 'fair': return '一般'
      case 'poor': return '较差'
      default: return '未知'
    }
  }
</script>

<div class='space-y-6'>
  <!-- 安全评分和问题统计 -->
  <div class='flex gap-6'>
    <!-- 安全评分 -->
    <div class='card bg-base-100 shadow flex-none'>
      <div class='card-body'>
        <div class='flex items-center gap-4'>
          <div class='radial-progress {getScoreColor(audit.getSecurityScore())}' style='--value:{audit.getSecurityScore()};' role='progressbar'>
            {audit.getSecurityScore()}
          </div>
          <div>
            <div class='text-lg font-medium'>
              安全等级: <span class='badge {getScoreBadgeColor(audit.getSecurityLevel())}'>{getSecurityLevelText(audit.getSecurityLevel())}</span>
            </div>
            <div class='text-sm text-base-content/70 mt-1'>
              基于 {audit.statistics.totalEntries} 个密码条目的综合评估
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 问题统计 -->
    <div class='stats shadow flex-1'>
      <div class='stat'>
        <div class='stat-title'>总问题数</div>
        <div class='stat-value'>{securityIssues.length}</div>
      </div>
      <div class='stat'>
        <div class='stat-title'>高危问题</div>
        <div class='stat-value text-error'>{securityIssues.filter(i => i.severity === 'high').length}</div>
      </div>
      <div class='stat'>
        <div class='stat-title'>中危问题</div>
        <div class='stat-value text-warning'>{securityIssues.filter(i => i.severity === 'medium').length}</div>
      </div>
      <div class='stat'>
        <div class='stat-title'>低危问题</div>
        <div class='stat-value text-info'>{securityIssues.filter(i => i.severity === 'low').length}</div>
      </div>
    </div>
  </div>

  <!-- 密码分析 -->
  <div class='card bg-base-100 shadow'>
    <div class='card-body'>
      <h3 class='card-title'>密码审计</h3>

      <!-- 详细统计 -->
      <div class='stats shadow mt-4'>
        <div class='stat'>
          <div class='stat-title'>强密码占比</div>
          <div class='stat-value text-success'>{audit.statistics.strongPasswordsPercentage}%</div>
          <div class='stat-desc'>安全强度良好的密码比例</div>
        </div>
        <div class='stat'>
          <div class='stat-title'>弱密码</div>
          <div class='stat-value text-error'>{audit.statistics.weakPasswords}</div>
          <div class='stat-desc'>需要加强的密码数量</div>
        </div>
        <div class='stat'>
          <div class='stat-title'>重复密码组</div>
          <div class='stat-value text-warning'>{audit.statistics.duplicatePasswords}</div>
          <div class='stat-desc'>相同密码的组数</div>
        </div>
        <div class='stat'>
          <div class='stat-title'>过期密码</div>
          <div class='stat-value text-info'>{audit.statistics.oldPasswords}</div>
          <div class='stat-desc'>超过1年未更新</div>
        </div>
        <div class='stat'>
          <div class='stat-title'>平均密码年龄</div>
          <div class='stat-value'>{audit.statistics.averagePasswordAge}</div>
          <div class='stat-desc'>天数</div>
        </div>
      </div>

      <!-- 分布图表 -->
      <div class='grid grid-cols-2 gap-6 mt-6'>
        <!-- 长度分布 -->
        <div class='space-y-3'>
          <h4 class='font-medium text-center text-sm'>长度分布</h4>
          <div class='h-64'>
            <BarChart
              data={audit.statistics.passwordLengthDistribution}
              x='length'
              y='count'
              xLabel='密码长度'
              yLabel='数量'
            />
          </div>
        </div>

        <!-- 强度分布 -->
        <div class='space-y-3'>
          <h4 class='font-medium text-center text-sm'>强度分布</h4>
          <div class='h-64'>
            <PieChart
              data={audit.statistics.passwordStrengthDistribution}
              key='strength'
              value='count' />
          </div>
        </div>

        <!-- 年龄分布 -->
        <div class='space-y-3'>
          <h4 class='font-medium text-center text-sm'>年龄分布</h4>
          <div class='h-64'>
            <PieChart
              data={audit.statistics.passwordAgeDistribution}
              key='ageRange'
              value='count'
            />
          </div>
        </div>

        <!-- 字符类型使用情况 -->
        <div class='space-y-3'>
          <h4 class='font-medium text-center text-sm'>字符类型使用情况</h4>
          <div class='h-64'>
            <RadialChart
              data={[
                { type: '小写字母', count: audit.statistics.characterTypeUsage.lowercase },
                { type: '大写字母', count: audit.statistics.characterTypeUsage.uppercase },
                { type: '数字', count: audit.statistics.characterTypeUsage.numbers },
                { type: '符号', count: audit.statistics.characterTypeUsage.symbols },
              ]}
              x='type'
              y='count'
            />
          </div>
        </div>
      </div>
    </div>
  </div>

  {#if securityIssues.length === 0 && !isAnalyzing}
    <div class='alert alert-success'>
      <CheckCircle class='h-6 w-6' />
      <span>未发现安全问题</span>
    </div>
  {:else if !isAnalyzing}
    <!-- 安全建议 -->
    <div class='card bg-base-100 shadow'>
      <div class='card-body'>
        <h3 class='card-title'>安全建议</h3>
        <div class='space-y-2'>
          {#if audit.statistics.weakPasswords > 0}
            <div class='alert alert-error'>
              <ShieldAlert class='h-6 w-6' />
              <span>立即更新 {audit.statistics.weakPasswords} 个弱密码</span>
            </div>
          {/if}

          {#if audit.statistics.duplicatePasswords > 0}
            <div class='alert alert-warning'>
              <AlertTriangle class='h-6 w-6' />
              <span>为 {audit.statistics.duplicatePasswords} 组重复密码设置独特密码</span>
            </div>
          {/if}

          {#if audit.statistics.oldPasswords > 0}
            <div class='alert alert-info'>
              <Info class='h-6 w-6' />
              <span>考虑更新 {audit.statistics.oldPasswords} 个超过1年的密码</span>
            </div>
          {/if}

          {#if audit.statistics.totalIssues === 0}
            <div class='alert alert-success'>
              <CheckCircle class='h-6 w-6' />
              <span>密码安全状况良好！建议定期检查和更新密码。</span>
            </div>
          {/if}
        </div>
      </div>
    </div>
  {/if}
</div>
