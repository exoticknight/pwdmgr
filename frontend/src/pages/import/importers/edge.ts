import type { BaseImporter, ImportResult } from './types'

export class EdgeImporter implements BaseImporter {
  async process(_fileContent: string): Promise<ImportResult> {
    // TODO: Implement Edge password import logic
    return {
      success: false,
      count: 0,
      entries: [],
      errors: ['Edge import not yet implemented'],
    }
  }
}
