// Time formatting utilities

/**
 * Format date time to local format
 * @param isoString ISO 8601 format time string
 * @returns Formatted local time string
 */
export function formatDateTime(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleString()
}

/**
 * Format as relative time (e.g.: 2 days ago, 1 hour ago)
 * @param isoString ISO 8601 format time string
 * @returns Relative time string
 */
export function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()

  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffMonths = Math.floor(diffDays / 30)
  const diffYears = Math.floor(diffDays / 365)

  if (diffYears > 0) {
    return `${diffYears}年前`
  }
  else if (diffMonths > 0) {
    return `${diffMonths}个月前`
  }
  else if (diffDays > 0) {
    return `${diffDays}天前`
  }
  else if (diffHours > 0) {
    return `${diffHours}小时前`
  }
  else if (diffMinutes > 0) {
    return `${diffMinutes}分钟前`
  }
  else {
    return '刚刚'
  }
}

/**
 * Format as compact date time
 * @param isoString ISO 8601 format time string
 * @returns Compact format date time string
 */
export function formatCompactDateTime(isoString: string): string {
  const date = new Date(isoString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}`
}
