<script lang='ts'>
  import type { SecurityIssue } from '@/stores/audit.svelte'

  import { CheckCircle } from '@lucide/svelte'

  import { audit } from '@/stores/audit.svelte'

  let selectedSeverity: 'high' | 'medium' | 'low' = $state('high')

  const severityCounts = $derived(() => {
    return {
      high: audit.statistics.highSeverityIssues,
      medium: audit.statistics.mediumSeverityIssues,
      low: audit.statistics.lowSeverityIssues,
    }
  })

  const currentIssues = $derived(() => {
    return audit.issuesBySeverity[selectedSeverity]
  })

  function getIssueTitle(issue: SecurityIssue): string {
    switch (issue.type) {
      case 'weak_password':
        return '弱密码'
      case 'duplicate_password':
        return '重复密码'
      case 'old_password':
        return '密码过旧'
      case 'common_pattern': {
        const patternType = issue.patternType
        switch (patternType) {
          case 'sequential_chars': return '连续字符密码'
          case 'repeated_chars': return '重复字符密码'
          case 'lowercase_only': return '纯小写字母密码'
          case 'uppercase_only': return '纯大写字母密码'
          case 'numbers_only': return '纯数字密码'
          case 'letters_only': return '纯字母密码'
          case 'too_short': return '密码过短'
          default: return '常见模式密码'
        }
      }
      default:
        return '安全问题'
    }
  }

  function getIssueDescription(issue: SecurityIssue): string {
    switch (issue.type) {
      case 'weak_password':
        return '此密码强度较低，建议使用包含大小写字母、数字和特殊字符的复杂密码'
      case 'duplicate_password': {
        const count = issue.duplicateCount
        return `此密码在 ${count} 个账户中重复使用，建议为每个账户使用唯一密码`
      }
      case 'old_password': {
        const daysSinceUpdate = issue.daysSinceModified
        return `此密码已 ${daysSinceUpdate} 天未更新，建议定期更换密码`
      }
      case 'common_pattern':
        return '此密码使用了常见模式，容易被破解，建议使用更随机的密码'
      default:
        return '发现潜在安全风险'
    }
  }

  // 获取严重程度的颜色类
  function getSeverityClass(severity: string): string {
    switch (severity) {
      case 'high': return 'text-error'
      case 'medium': return 'text-warning'
      case 'low': return 'text-info'
      default: return 'text-base-content'
    }
  }

  // 获取严重程度的徽章类
  function getSeverityBadgeClass(severity: string): string {
    switch (severity) {
      case 'high': return 'badge-error'
      case 'medium': return 'badge-warning'
      case 'low': return 'badge-info'
      default: return 'badge-neutral'
    }
  }
</script>

{#if audit.securityIssues.length === 0 && !audit.isAnalyzing}
  <div class='alert alert-success'>
    <CheckCircle class='stroke-current shrink-0 h-6 w-6' />
    <span>未发现安全问题</span>
  </div>
{:else}
  <div class='flex flex-col max-h-full'>
    <div class='flex-none flex flex-wrap gap-3 mb-4'>
      <button
        class='badge badge-lg {selectedSeverity === 'high' ? 'badge-error' : 'badge-soft badge-error'} cursor-pointer transition-colors'
        onclick={() => selectedSeverity = 'high'}
      >
        高危 ({severityCounts().high})
      </button>
      <button
        class='badge badge-lg {selectedSeverity === 'medium' ? 'badge-warning' : 'badge-soft badge-warning'} cursor-pointer transition-colors'
        onclick={() => selectedSeverity = 'medium'}
      >
        中危 ({severityCounts().medium})
      </button>
      <button
        class='badge badge-lg {selectedSeverity === 'low' ? 'badge-info' : 'badge-soft badge-info'} cursor-pointer transition-colors'
        onclick={() => selectedSeverity = 'low'}
      >
        低危 ({severityCounts().low})
      </button>
    </div>

    <div class='flex-1 flex flex-col space-y-4 py-2 overflow-y-auto'>
      {#each currentIssues() as issue (issue.id)}
        <div class='card bg-base-100 shadow-sm border-l-4 {issue.severity === 'high' ? 'border-error' : issue.severity === 'medium' ? 'border-warning' : 'border-info'}'>
          <div class='card-body'>
            <div class='flex justify-between items-start'>
              <div class='flex-1'>
                <div class='flex items-center gap-2 mb-2'>
                  <h3 class='card-title {getSeverityClass(issue.severity)}'>{getIssueTitle(issue)}</h3>
                  <div class='badge badge-sm {getSeverityBadgeClass(issue.severity)}'>{issue.severity === 'high' ? '高危' : issue.severity === 'medium' ? '中危' : '低危'}</div>
                </div>
                <p class='text-base-content/70 mb-2'>{getIssueDescription(issue)}</p>
                {#if issue.itemTitle}
                  <div class='text-sm text-base-content/50'>
                    受影响的条目: <span class='font-medium'>{issue.itemTitle}</span>
                  </div>
                {/if}
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
{/if}
