import { data } from '@/stores/data.svelte'
import { PasswordGenerator } from '@/utils/password-generator'

interface DataItem {
  _id: string
  title: string
  password?: string
  _updatedAt?: string | number | Date
}

// 密码强度检查结果接口
interface PasswordStrengthResult {
  score: number
  feedback: string[]
  strength: 'weak' | 'fair' | 'good' | 'strong'
}

// 基础问题接口
interface BaseSecurityIssue {
  id: string
  severity: 'high' | 'medium' | 'low'
  itemId?: string
  itemTitle?: string
}

// 弱密码问题
interface WeakPasswordIssue extends BaseSecurityIssue {
  type: 'weak_password'
  strength: 'weak' | 'fair' | 'good' | 'strong'
  feedback: string[]
}

// 重复密码问题
interface DuplicatePasswordIssue extends BaseSecurityIssue {
  type: 'duplicate_password'
  duplicateCount: number
}

// 过期密码问题
interface OldPasswordIssue extends BaseSecurityIssue {
  type: 'old_password'
  daysSinceModified: number
}

// 常见模式问题
interface CommonPatternIssue extends BaseSecurityIssue {
  type: 'common_pattern'
  patternType: 'lowercase_only' | 'uppercase_only' | 'numbers_only' | 'letters_only' | 'too_short' | 'repeated_chars' | 'sequential_chars'
  regex: string
}

// 联合类型
export type SecurityIssue = WeakPasswordIssue | DuplicatePasswordIssue | OldPasswordIssue | CommonPatternIssue

// 统一的审计统计数据结构
export interface AuditStatistics {
  // 基础统计
  totalEntries: number
  totalIssues: number
  totalPasswords: number

  // 问题分类统计
  highSeverityIssues: number
  mediumSeverityIssues: number
  lowSeverityIssues: number
  weakPasswords: number
  mediumPasswords: number
  strongPasswords: number
  duplicatePasswords: number
  oldPasswords: number

  // 评分相关
  totalScore: number
  averageScore: number
  averagePasswordAge: number
  strongPasswordsPercentage: number

  // 时间相关统计
  recentlyModifiedCount: number

  // 分布数据
  passwordLengthDistribution: { length: number, count: number }[]
  passwordStrengthDistribution: { strength: string, count: number, percentage: number }[]
  passwordAgeDistribution: { ageRange: string, count: number }[]
  characterTypeUsage: {
    lowercase: number
    uppercase: number
    numbers: number
    symbols: number
  }
  commonPatterns: { patternType: 'lowercase_only' | 'uppercase_only' | 'numbers_only' | 'letters_only' | 'too_short' | 'repeated_chars' | 'sequential_chars', count: number, regex: string }[]
}

// 数据收集器接口
interface DataCollectors {
  passwordMap: Map<string, string[]>
  lengthDistribution: Map<number, number>
  strengthDistribution: Map<string, number>
  ageDistribution: Map<string, number>
  totalPasswordAge: number
  passwordsWithAge: number
  strongPasswords: number
  characterTypes: {
    lowercase: number
    uppercase: number
    numbers: number
    symbols: number
  }
}

class Audit {
  #securityIssues = $state<SecurityIssue[]>([])
  #isAnalyzing = $state(false)
  #lastAnalyzed = $state<Date | null>(null)
  #hasAnalyzed = $state(false)

  // 使用统一的统计数据结构
  #statistics = $state<AuditStatistics>({
    // 基础统计
    totalEntries: 0,
    totalIssues: 0,
    totalPasswords: 0,

    // 问题分类统计
    highSeverityIssues: 0,
    mediumSeverityIssues: 0,
    lowSeverityIssues: 0,
    weakPasswords: 0,
    mediumPasswords: 0,
    strongPasswords: 0,
    duplicatePasswords: 0,
    oldPasswords: 0,

    // 评分相关
    totalScore: 0,
    averageScore: 0,
    averagePasswordAge: 0,
    strongPasswordsPercentage: 0,

    // 时间相关统计
    recentlyModifiedCount: 0,

    // 分布数据
    passwordLengthDistribution: [],
    passwordStrengthDistribution: [],
    passwordAgeDistribution: [],
    characterTypeUsage: {
      lowercase: 0,
      uppercase: 0,
      numbers: 0,
      symbols: 0,
    },
    commonPatterns: [],
  })

  // 公开访问器
  get securityIssues(): SecurityIssue[] {
    return this.#securityIssues
  }

  get isAnalyzing(): boolean {
    return this.#isAnalyzing
  }

  get statistics(): AuditStatistics {
    return this.#statistics
  }

  get lastAnalyzed(): Date | null {
    return this.#lastAnalyzed
  }

  get hasAnalyzed(): boolean {
    return this.#hasAnalyzed
  }

  // 统一的分析函数，一次遍历生成所有数据
  analyze() {
    this.#isAnalyzing = true
    this.#securityIssues = []

    try {
      const entries = data.entries

      // 使用子流程函数进行分析
      const analysisResult = this.#performComprehensiveAnalysis(entries)

      // 更新状态
      this.#securityIssues = analysisResult.issues
      this.#statistics = analysisResult.statistics
      this.#lastAnalyzed = new Date()
      this.#hasAnalyzed = true
    }
    finally {
      this.#isAnalyzing = false
    }
  }

  // 综合分析主函数 - 一次遍历生成所有数据
  #performComprehensiveAnalysis(entries: DataItem[]) {
    // 初始化数据收集器
    const dataCollectors = this.#initializeDataCollectors()
    const issues: SecurityIssue[] = []

    // 单次遍历收集所有数据
    entries.forEach((item) => {
      this.#analyzePasswordItem(item, dataCollectors, issues)
    })

    // 后处理：检测重复密码
    this.#processPasswordDuplicates(dataCollectors.passwordMap, entries, issues)

    // 计算所有统计数据
    const statistics = this.#calculateStatistics(entries, dataCollectors, issues)

    return { issues, statistics }
  }

  // 初始化数据收集器
  #initializeDataCollectors() {
    return {
      passwordMap: new Map<string, string[]>(),
      lengthDistribution: new Map<number, number>(),
      strengthDistribution: new Map<string, number>(),
      ageDistribution: new Map<string, number>(),
      totalPasswordAge: 0,
      passwordsWithAge: 0,
      strongPasswords: 0,
      characterTypes: {
        lowercase: 0,
        uppercase: 0,
        numbers: 0,
        symbols: 0,
      },
    }
  }

  // 分析单个密码项
  #analyzePasswordItem(item: DataItem, collectors: DataCollectors, issues: SecurityIssue[]) {
    // 分析密码强度和收集统计数据
    if (item.password != null && item.password.trim() !== '') {
      const strengthResult = this.#analyzePasswordSecurity(item, collectors, issues)
      this.#collectPasswordStatistics(item, collectors, strengthResult)
      this.#collectPasswordForDuplicateCheck(item, collectors)
    }

    // 分析密码年龄
    if (item._updatedAt != null) {
      this.#analyzePasswordAge(item, collectors, issues)
    }
  }

  // 分析密码安全性
  #analyzePasswordSecurity(item: DataItem, collectors: DataCollectors, issues: SecurityIssue[]): PasswordStrengthResult {
    const strengthResult = PasswordGenerator.checkStrength(item.password!)

    // 检查弱密码
    if (strengthResult.strength === 'weak' || strengthResult.strength === 'fair') {
      issues.push({
        id: `weak_${item._id}`,
        type: 'weak_password',
        severity: strengthResult.strength === 'weak' ? 'high' : 'medium',
        strength: strengthResult.strength,
        feedback: strengthResult.feedback,
        itemId: item._id,
        itemTitle: item.title,
      } as WeakPasswordIssue)
    }
    else if (strengthResult.strength === 'good' || strengthResult.strength === 'strong') {
      collectors.strongPasswords++
    }

    return strengthResult
  }

  // 收集密码统计数据
  #collectPasswordStatistics(item: DataItem, collectors: DataCollectors, strengthResult: PasswordStrengthResult) {
    const password = item.password!

    // 统计密码长度分布
    const length = password.length
    collectors.lengthDistribution.set(length, (collectors.lengthDistribution.get(length) ?? 0) + 1)

    // 统计密码强度分布 - 复用已计算的结果
    collectors.strengthDistribution.set(strengthResult.strength, (collectors.strengthDistribution.get(strengthResult.strength) ?? 0) + 1)

    // 统计字符类型使用
    if (/[a-z]/.test(password))
      collectors.characterTypes.lowercase++
    if (/[A-Z]/.test(password))
      collectors.characterTypes.uppercase++
    if (/\d/.test(password))
      collectors.characterTypes.numbers++
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password))
      collectors.characterTypes.symbols++
  }

  // 收集密码用于重复检查
  #collectPasswordForDuplicateCheck(item: DataItem, collectors: DataCollectors) {
    const password = item.password!
    if (collectors.passwordMap.has(password)) {
      collectors.passwordMap.get(password)!.push(item._id)
    }
    else {
      collectors.passwordMap.set(password, [item._id])
    }
  }

  // 分析密码年龄
  #analyzePasswordAge(item: DataItem, collectors: DataCollectors, issues: SecurityIssue[]) {
    const daysSinceModified = Math.floor((Date.now() - new Date(item._updatedAt!).getTime()) / (1000 * 60 * 60 * 24))

    collectors.totalPasswordAge += daysSinceModified
    collectors.passwordsWithAge++

    // 统计年龄分布
    const ageRangeKey = this.#getAgeRangeKey(daysSinceModified)
    collectors.ageDistribution.set(ageRangeKey, (collectors.ageDistribution.get(ageRangeKey) ?? 0) + 1)

    // 检查过期密码
    if (daysSinceModified > 365) {
      issues.push({
        id: `old_${item._id}`,
        type: 'old_password',
        severity: 'medium',
        daysSinceModified,
        itemId: item._id,
        itemTitle: item.title,
      } as OldPasswordIssue)
    }
  }

  // 获取年龄范围键
  #getAgeRangeKey(daysSinceModified: number): string {
    if (daysSinceModified < 30)
      return '0-30'
    if (daysSinceModified < 90)
      return '30-90'
    if (daysSinceModified < 180)
      return '90-180'
    if (daysSinceModified < 365)
      return '180-365'
    return '365+'
  }

  // 处理重复密码
  #processPasswordDuplicates(passwordMap: Map<string, string[]>, entries: DataItem[], issues: SecurityIssue[]) {
    passwordMap.forEach((itemIds) => {
      if (itemIds.length > 1) {
        itemIds.forEach((itemId) => {
          const item = entries.find(i => i._id === itemId)
          issues.push({
            id: `duplicate_${itemId}`,
            type: 'duplicate_password',
            severity: 'high',
            duplicateCount: itemIds.length,
            itemId,
            itemTitle: item?.title ?? '',
          } as DuplicatePasswordIssue)
        })
      }
    })
  }

  // 计算所有统计数据
  #calculateStatistics(entries: DataItem[], collectors: DataCollectors, issues: SecurityIssue[]): AuditStatistics {
    const totalEntries = entries.length
    const duplicateGroups = Array.from(collectors.passwordMap.values()).filter((ids: string[]) => ids.length > 1).length

    // 计算分布数据
    const passwordLengthDistribution = Array.from(collectors.lengthDistribution.entries())
      .map(([length, count]) => ({ length, count }))
      .sort((a, b) => a.length - b.length)

    const passwordStrengthDistribution = Array.from(collectors.strengthDistribution.entries())
      .map(([strength, count]) => ({
        strength,
        count,
        percentage: totalEntries > 0 ? Math.round((count / totalEntries) * 100) : 0,
      }))

    const passwordAgeDistribution = Array.from(collectors.ageDistribution.entries())
      .map(([ageRange, count]) => ({ ageRange, count }))
      .sort((a, b) => {
        // 简单排序：按照预定义的顺序
        const order = ['0-30', '30-90', '90-180', '180-365', '365+']
        return order.indexOf(a.ageRange) - order.indexOf(b.ageRange)
      })

    // 预先计算各种筛选结果，避免重复筛选
    const highSeverityIssues = issues.filter(i => i.severity === 'high')
    const mediumSeverityIssues = issues.filter(i => i.severity === 'medium')
    const lowSeverityIssues = issues.filter(i => i.severity === 'low')
    const weakPasswordIssues = issues.filter(i => i.type === 'weak_password')
    const oldPasswordIssues = issues.filter(i => i.type === 'old_password')

    // 计算评分
    const strongPasswordsPercentage = totalEntries > 0 ? Math.round((collectors.strongPasswords / totalEntries) * 100) : 0
    const totalScore = this.#calculateSecurityScore(totalEntries, highSeverityIssues.length, mediumSeverityIssues.length, lowSeverityIssues.length)
    const mediumPasswords = collectors.strengthDistribution.get('fair') ?? 0

    return {
      // 基础统计
      totalEntries,
      totalIssues: issues.length,
      totalPasswords: totalEntries,

      // 问题分类统计
      highSeverityIssues: highSeverityIssues.length,
      mediumSeverityIssues: mediumSeverityIssues.length,
      lowSeverityIssues: lowSeverityIssues.length,
      weakPasswords: weakPasswordIssues.length,
      mediumPasswords,
      strongPasswords: collectors.strongPasswords,
      duplicatePasswords: duplicateGroups,
      oldPasswords: oldPasswordIssues.length,

      // 评分相关
      totalScore,
      averageScore: strongPasswordsPercentage,
      averagePasswordAge: collectors.passwordsWithAge > 0 ? Math.round(collectors.totalPasswordAge / collectors.passwordsWithAge) : 0,
      strongPasswordsPercentage,

      // 时间相关统计
      recentlyModifiedCount: collectors.ageDistribution.get('0-30') ?? 0,

      // 分布数据
      passwordLengthDistribution,
      passwordStrengthDistribution,
      passwordAgeDistribution,
      characterTypeUsage: collectors.characterTypes,
      commonPatterns: this.#detectCommonPatterns(entries),
    }
  }

  // 计算安全评分
  #calculateSecurityScore(totalEntries: number, highSeverityCount: number, mediumSeverityCount: number, lowSeverityCount: number): number {
    if (totalEntries === 0) {
      return 100
    }

    const deduction = (highSeverityCount * 10) + (mediumSeverityCount * 5) + (lowSeverityCount * 2)
    const maxPossibleDeduction = totalEntries * 10

    return Math.max(0, 100 - Math.round((deduction / maxPossibleDeduction) * 100))
  }

  // 获取按类型分组的问题
  getIssuesByType() {
    const issues = this.securityIssues
    return {
      weakPasswords: issues.filter(i => i.type === 'weak_password'),
      duplicatePasswords: issues.filter(i => i.type === 'duplicate_password'),
      oldPasswords: issues.filter(i => i.type === 'old_password'),
    }
  }

  // 获取按严重程度分组的问题
  getIssuesBySeverity() {
    const issues = this.securityIssues
    return {
      high: issues.filter(i => i.severity === 'high'),
      medium: issues.filter(i => i.severity === 'medium'),
      low: issues.filter(i => i.severity === 'low'),
    }
  }

  // 获取安全评分 (0-100)
  getSecurityScore(): number {
    return this.statistics.totalScore
  }

  // 获取安全等级
  getSecurityLevel(): 'excellent' | 'good' | 'fair' | 'poor' {
    const score = this.getSecurityScore()
    if (score >= 90) {
      return 'excellent'
    }
    if (score >= 75) {
      return 'good'
    }
    if (score >= 50) {
      return 'fair'
    }
    return 'poor'
  }

  // 导出统计数据
  exportData(_format: 'json' | 'csv' | 'excel') {
    // 这里可以添加实际的导出逻辑
    return this.statistics
  }

  // 检测常见密码模式
  #detectCommonPatterns(entries: DataItem[]): { patternType: 'lowercase_only' | 'uppercase_only' | 'numbers_only' | 'letters_only' | 'too_short' | 'repeated_chars' | 'sequential_chars', count: number, regex: string }[] {
    const patterns: { regex: RegExp, patternType: 'lowercase_only' | 'uppercase_only' | 'numbers_only' | 'letters_only' | 'too_short' | 'repeated_chars' | 'sequential_chars' }[] = [
      { regex: /^[a-z]+$/, patternType: 'lowercase_only' },
      { regex: /^[A-Z]+$/, patternType: 'uppercase_only' },
      { regex: /^\d+$/, patternType: 'numbers_only' },
      { regex: /^[a-z]+$/i, patternType: 'letters_only' },
      { regex: /^.{1,6}$/, patternType: 'too_short' },
      { regex: /(.)\1{2,}/, patternType: 'repeated_chars' },
      { regex: /123|abc|qwe/i, patternType: 'sequential_chars' },
    ]

    const patternCounts = patterns.map(({ regex, patternType }) => {
      const count = entries.filter(item =>
        item.password != null && item.password.trim() !== '' && regex.test(item.password),
      ).length
      return { patternType, count, regex: regex.source }
    }).filter(p => p.count > 0)

    return patternCounts
  }
}

export const audit = new Audit()
