import type { BaseImporter, ImportResult } from './types'

export class FirefoxImporter implements BaseImporter {
  async process(_fileContent: string): Promise<ImportResult> {
    // TODO: Implement Firefox password import logic
    return {
      success: false,
      count: 0,
      entries: [],
      errors: ['Firefox import not yet implemented'],
    }
  }
}
