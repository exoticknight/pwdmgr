import type { BaseImporter, ImportEntry, ImportResult } from './types'
import { DataMetaType } from '@/types/data'

interface BitwardenEntry {
  type?: number
  name?: string
  login?: {
    username?: string
    password?: string
    uris?: Array<{ uri?: string }>
  }
  notes?: string
}

export class BitwardenImporter implements BaseImporter {
  async process(fileContent: string): Promise<ImportResult> {
    try {
      const jsonData: unknown = JSON.parse(fileContent)

      if (!Array.isArray(jsonData)) {
        return {
          success: false,
          count: 0,
          entries: [],
          errors: ['Invalid Bitwarden format: expected array of entries'],
        }
      }

      const entries: ImportEntry[] = []
      const errors: string[] = []

      for (const [index, item] of jsonData.entries()) {
        if (typeof item !== 'object' || item === null) {
          errors.push(`Entry ${index + 1}: invalid data format`)
          continue
        }

        const entry = item as BitwardenEntry

        // Only process login entries (type 1)
        if (entry.type !== 1) {
          continue
        }

        const now = new Date().toISOString()
        const importEntry = {
          _type: DataMetaType.PASSWORD,
          _isFavorite: false,
          _createdAt: now,
          _updatedAt: now,
          title: entry.name ?? `Imported Entry ${index + 1}`,
          username: entry.login?.username ?? '',
          password: entry.login?.password ?? '',
          notes: entry.notes ?? '',
          url: entry.login?.uris?.[0]?.uri ?? '',
        }

        entries.push(importEntry)
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
        errors: [`Failed to parse Bitwarden JSON: ${error instanceof Error ? error.message : 'Unknown error'}`],
      }
    }
  }
}
