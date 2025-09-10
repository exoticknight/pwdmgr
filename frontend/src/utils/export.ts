import type { DataFile } from '@/types/datafile'

/**
 * Convert database to CSV format
 */
export function exportToCSV(databaseData: DataFile): string {
  const entries = databaseData.data

  if (entries.length === 0) {
    return ''
  }

  // CSV headers
  const headers = [
    'Title',
    'Username',
    'Password',
    'Notes',
    'Type',
    'Favorite',
    'Created At',
    'Updated At',
    'Last Used At',
  ]

  // Convert entries to CSV rows (excluding _id and _type)
  const rows = entries.map((entry) => {
    // Handle different data types
    let username = ''
    let password = ''

    if (entry._type === 'password') {
      username = entry.username || ''
      password = entry.password || ''
    }
    else if (entry._type === 'two_factor_auth') {
      username = entry.username || ''
      password = '[2FA Entry]'
    }

    return [
      escapeCSVField(entry.title || ''),
      escapeCSVField(username),
      escapeCSVField(password),
      escapeCSVField(entry.notes ?? ''),
      escapeCSVField(entry._type),
      entry._isFavorite ? 'true' : 'false',
      entry._createdAt || '',
      entry._updatedAt || '',
      entry._lastUsedAt ?? '',
    ]
  })

  // Combine headers and rows
  const csvContent = [headers, ...rows]
    .map(row => row.join(','))
    .join('\n')

  return csvContent
}

/**
 * Convert database to formatted JSON string
 */
export function exportToJSON(databaseData: DataFile): string {
  const cleanData = databaseData.data.map((entry) => {
    const { _id, ...rest } = entry
    return rest
  })

  return JSON.stringify(cleanData, null, 2)
}

/**
 * Escape CSV field (handle commas, quotes, and newlines)
 */
function escapeCSVField(field: string): string {
  // If field contains comma, quote, or newline, wrap in quotes and escape quotes
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`
  }
  return field
}
