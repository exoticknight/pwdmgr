import type { DataFile } from '@/types/datafile'

/**
 * Convert database to CSV format
 */
export function exportToCSV(databaseData: DataFile): string {
  const entries = databaseData.data

  if (entries.length === 0) {
    return ''
  }

  // CSV headers - readable names matching JSON keys
  const headers = [
    'Title',
    'Username',
    'Password',
    'Notes',
    'Is Favorite',
    'Created At',
    'Updated At',
    'Last Used At',
  ]

  // Convert entries to CSV rows (excluding _id and _type)
  const rows = entries.map(entry => [
    escapeCSVField(entry.title || ''),
    escapeCSVField(entry.username || ''),
    escapeCSVField(entry.password || ''),
    escapeCSVField(entry.notes ?? ''),
    entry._isFavorite ? 'true' : 'false',
    entry._createdAt || '',
    entry._updatedAt || '',
    entry._lastUsedAt ?? '',
  ])

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
  // Create a clean data structure with only necessary fields and readable keys
  const cleanData = databaseData.data.map(entry => ({
    title: entry.title,
    username: entry.username,
    password: entry.password,
    notes: entry.notes ?? '',
    isFavorite: entry._isFavorite,
    createdAt: entry._createdAt,
    updatedAt: entry._updatedAt,
    lastUsedAt: entry._lastUsedAt ?? '',
  }))

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
