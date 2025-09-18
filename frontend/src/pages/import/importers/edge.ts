import type { BaseImporter, ImportEntry, ImportResult } from './types'
import Papa from 'papaparse'
import { DataMetaType } from '@/types/data'

interface EdgeCSVRow {
  name?: string
  url?: string
  username?: string
  password?: string
  note?: string
}

export class EdgeImporter implements BaseImporter {
  async process(fileContent: string): Promise<ImportResult> {
    try {
      const result = Papa.parse<EdgeCSVRow>(fileContent, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header: string) => header.trim().toLowerCase(),
      })

      if (result.errors.length > 0) {
        const errors = result.errors.map(error => `Parse error: ${error.message}`)
        return {
          success: false,
          count: 0,
          entries: [],
          errors,
        }
      }

      if (result.data.length === 0) {
        return {
          success: false,
          count: 0,
          entries: [],
          errors: ['No valid data found in CSV'],
        }
      }

      const entries: ImportEntry[] = []
      const errors: string[] = []

      for (const [index, row] of result.data.entries()) {
        try {
          const now = new Date().toISOString()

          const title = row.name ?? row.url ?? `Imported Entry ${index + 1}`
          const username = row.username ?? ''
          const password = row.password ?? ''
          const url = row.url ?? ''
          const notes = row.note ?? ''

          const entry = {
            _type: DataMetaType.PASSWORD,
            _isFavorite: false,
            _createdAt: now,
            _updatedAt: now,
            title,
            username,
            password,
            notes,
            url,
          }

          entries.push(entry)
        }
        catch (error) {
          errors.push(`Row ${index + 1}: ${error instanceof Error ? error.message : 'parsing error'}`)
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
        entries: [],
        errors: [`Failed to parse Edge CSV: ${error instanceof Error ? error.message : 'Unknown error'}`],
      }
    }
  }
}
