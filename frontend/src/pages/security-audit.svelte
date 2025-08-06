<script lang='ts'>
  import { onMount } from 'svelte'
  import { data } from '@/stores/data.svelte'
  import { i18n } from '@/stores/i18n.svelte'

  type SecurityIssue = {
    id: string
    type: 'weak_password' | 'duplicate_password' | 'old_password'
    severity: 'high' | 'medium' | 'low'
    title: string
    description: string
    itemId?: string
    itemTitle?: string
  }

  let securityIssues: SecurityIssue[] = $state([])
  let isAnalyzing = $state(false)

  // 分析密码安全问题
  function analyzeSecurityIssues() {
    isAnalyzing = true
    securityIssues = []

    try {
      const entries = data.entries
      const passwordMap = new Map<string, string[]>()

      entries.forEach((item) => {
        // 检查弱密码
        if (item.password && isWeakPassword(item.password)) {
          securityIssues.push({
            id: `weak_${item._id}`,
            type: 'weak_password',
            severity: 'high',
            title: '弱密码',
            description: '此密码强度较弱，建议使用更复杂的密码',
            itemId: item._id,
            itemTitle: item.title,
          })
        }

        // 收集密码用于重复检查
        if (item.password) {
          if (passwordMap.has(item.password)) {
            passwordMap.get(item.password)!.push(item._id)
          }
          else {
            passwordMap.set(item.password, [item._id])
          }
        }

        // 检查密码年龄
        if (item._updatedAt) {
          const daysSinceModified = Math.floor((Date.now() - new Date(item._updatedAt).getTime()) / (1000 * 60 * 60 * 24))
          if (daysSinceModified > 365) {
            securityIssues.push({
              id: `old_${item._id}`,
              type: 'old_password',
              severity: 'medium',
              title: '密码过期',
              description: `此密码已超过 ${daysSinceModified} 天未更新`,
              itemId: item._id,
              itemTitle: item.title,
            })
          }
        }
      })

      // 处理重复密码
      passwordMap.forEach((itemIds, _password) => {
        if (itemIds.length > 1) {
          itemIds.forEach((itemId) => {
            const item = entries.find(i => i._id === itemId)
            securityIssues.push({
              id: `duplicate_${itemId}`,
              type: 'duplicate_password',
              severity: 'high',
              title: '重复密码',
              description: `此密码被 ${itemIds.length} 个条目使用`,
              itemId,
              itemTitle: item?.title || '',
            })
          })
        }
      })
    }
    finally {
      isAnalyzing = false
    }
  }

  // 检查是否为弱密码
  function isWeakPassword(password: string): boolean {
    if (password.length < 8) {
      return true
    }

    const hasLower = /[a-z]/.test(password)
    const hasUpper = /[A-Z]/.test(password)
    const hasDigit = /\d/.test(password)
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    const criteria = [hasLower, hasUpper, hasDigit, hasSpecial].filter(Boolean).length
    return criteria < 3
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

  onMount(() => {
    analyzeSecurityIssues()
  })
</script>

<div class='w-full h-full p-6 overflow-y-auto'>
  <div class='max-w-4xl mx-auto'>
    <!-- 标题和刷新按钮 -->
    <div class='flex justify-between items-center mb-6'>
      <h1 class='text-3xl font-bold'>{i18n.t('navigation.securityAudit')}</h1>
      <button
        class='btn btn-primary'
        class:loading={isAnalyzing}
        onclick={analyzeSecurityIssues}
        disabled={isAnalyzing}
      >
        {isAnalyzing ? '分析中...' : '刷新分析'}
      </button>
    </div>

    <!-- 统计概览 -->
    <div class='stats shadow mb-6 w-full'>
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

    <!-- 安全问题列表 -->
    {#if securityIssues.length === 0 && !isAnalyzing}
      <div class='alert alert-success'>
        <svg xmlns='http://www.w3.org/2000/svg' class='stroke-current shrink-0 h-6 w-6' fill='none' viewBox='0 0 24 24'>
          <path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
        </svg>
        <span>未发现安全问题</span>
      </div>
    {:else}
      <div class='space-y-4'>
        {#each securityIssues as issue (issue.id)}
          <div class='card bg-base-100 shadow-xl border-l-4 {issue.severity === 'high' ? 'border-error' : issue.severity === 'medium' ? 'border-warning' : 'border-info'}'>
            <div class='card-body'>
              <div class='flex justify-between items-start'>
                <div class='flex-1'>
                  <div class='flex items-center gap-2 mb-2'>
                    <h3 class='card-title {getSeverityClass(issue.severity)}'>{issue.title}</h3>
                    <div class='badge {getSeverityBadgeClass(issue.severity)}'>{issue.severity === 'high' ? '高危' : issue.severity === 'medium' ? '中危' : '低危'}</div>
                  </div>
                  <p class='text-base-content/70 mb-2'>{issue.description}</p>
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
    {/if}
  </div>
</div>
