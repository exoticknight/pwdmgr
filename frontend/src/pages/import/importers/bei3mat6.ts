import type { BaseImporter, ImportEntry, ImportResult } from './types'
import type { Datum } from '@/types/data'
import typia from 'typia'

export class Bei3mat6Importer implements BaseImporter {
  async process(fileContent: string): Promise<ImportResult> {
    try {
      const jsonData = JSON.parse(fileContent) as ImportEntry[]

      if (!Array.isArray(jsonData)) {
        return {
          success: false,
          count: 0,
          entries: [],
          errors: ['Invalid bei3mat6 format: expected array of entries'],
        }
      }

      const entries: ImportEntry[] = []
      const errors: string[] = []

      for (const [index, item] of jsonData.entries()) {
        if (typeof item !== 'object' || item === null) {
          errors.push(`Entry ${index + 1}: invalid data format`)
          continue
        }

        try {
          typia.assert<ImportEntry>(item)
          entries.push(item)
        }
        catch (error) {
          errors.push(`Entry ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
        errors: [`Failed to parse bei3mat6 JSON: ${error instanceof Error ? error.message : 'Unknown error'}`],
      }
    }
  }
}
