import type { BaseImporter, ImportResult } from './types'
import type { PasswordData } from '@/types/data'
import { DataMetaType } from '@/types/data'

export class KeePassImporter implements BaseImporter {
  async process(fileContent: string): Promise<ImportResult> {
    try {
      const lines = fileContent.split('\n').map(line => line.trim()).filter(line => line.length > 0)

      if (lines.length < 2) {
        return {
          success: false,
          count: 0,
          errors: ['Invalid KeePass CSV format: insufficient data'],
        }
      }

      const headers = this.parseCSVLine(lines[0])
      const entries: PasswordData[] = []
      const errors: string[] = []

      // Find column indices
      const titleIndex = this.findColumnIndex(headers, ['title', 'account', 'name'])
      const usernameIndex = this.findColumnIndex(headers, ['username', 'user', 'login'])
      const passwordIndex = this.findColumnIndex(headers, ['password', 'pass'])
      const urlIndex = this.findColumnIndex(headers, ['url', 'website', 'site'])
      const notesIndex = this.findColumnIndex(headers, ['notes', 'note', 'comments'])

      for (let i = 1; i < lines.length; i++) {
        try {
          const values = this.parseCSVLine(lines[i])

          if (values.length < headers.length) {
            errors.push(`Line ${i + 1}: insufficient columns`)
            continue
          }

          const now = new Date().toISOString()
          const importEntry: PasswordData = {
            _id: crypto.randomUUID(),
            _type: DataMetaType.PASSWORD,
            _isFavorite: false,
            _createdAt: now,
            _updatedAt: now,
            title: values[titleIndex] ?? `Imported Entry ${i}`,
            username: values[usernameIndex] ?? '',
            password: values[passwordIndex] ?? '',
            notes: values[notesIndex] ?? '',
            url: values[urlIndex] ?? '',
          }

          entries.push(importEntry)
        }
        catch (error) {
          errors.push(`Line ${i + 1}: ${error instanceof Error ? error.message : 'parsing error'}`)
        }
      }

      return {
        success: true,
        count: entries.length,
        entries,
        errors: errors.length > 0 ? errors : undefined,
      }
    }
    catch (error) {
      return {
        success: false,
        count: 0,
        errors: [`Failed to parse KeePass CSV: ${error instanceof Error ? error.message : 'Unknown error'}`],
      }
    }
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"'
          i++ // Skip next quote
        }
        else {
          inQuotes = !inQuotes
        }
      }
      else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      }
      else {
        current += char
      }
    }

    result.push(current.trim())
    return result
  }

  private findColumnIndex(headers: string[], candidates: string[]): number {
    for (const candidate of candidates) {
      const index = headers.findIndex(header =>
        header.toLowerCase().includes(candidate.toLowerCase()),
      )
      if (index !== -1) {
        return index
      }
    }
    return -1
  }
}
