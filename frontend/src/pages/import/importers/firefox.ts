import type { BaseImporter, ImportEntry, ImportResult } from './types'
import Papa from 'papaparse'
import { DataMetaType } from '@/types/data'

interface FirefoxCSVRow {
  url?: string
  username?: string
  password?: string
  httpRealm?: string
  formActionOrigin?: string
  guid?: string
  timeCreated?: string
  timeLastUsed?: string
  timePasswordChanged?: string
}

export class FirefoxImporter implements BaseImporter {
  async process(fileContent: string): Promise<ImportResult> {
    try {
      const result = Papa.parse<FirefoxCSVRow>(fileContent, {
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

          // Use URL as title, fallback to domain extraction or generic title
          let title = row.url ?? `Imported Entry ${index + 1}`
          try {
            if (row.url) {
              const url = new URL(row.url)
              title = url.hostname || row.url
            }
          }
          catch {
            // Keep original URL if parsing fails
            title = row.url ?? `Imported Entry ${index + 1}`
          }

          const username = row.username ?? ''
          const password = row.password ?? ''
          const url = row.url ?? ''

          // Add Firefox-specific metadata to notes if available
          const notes = [
            row.httpRealm ? `HTTP Realm: ${row.httpRealm}` : '',
            row.formActionOrigin ? `Form Action Origin: ${row.formActionOrigin}` : '',
            row.guid ? `GUID: ${row.guid}` : '',
          ].filter(Boolean).join('\n')

          // Parse timestamps if available
          const createdAt = now
          const updatedAt = now

          const entry = {
            _type: DataMetaType.PASSWORD,
            _isFavorite: false,
            _createdAt: createdAt,
            _updatedAt: updatedAt,
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
        errors: [`Failed to parse Firefox CSV: ${error instanceof Error ? error.message : 'Unknown error'}`],
      }
    }
  }
}
