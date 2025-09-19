import type { BaseImporter, ImportResult } from './types'
import { ChromeImporter } from './chrome'

export class EdgeImporter implements BaseImporter {
  private chromeImporter = new ChromeImporter()

  async process(fileContent: string): Promise<ImportResult> {
    // Edge uses the same CSV format as Chrome, so we can reuse Chrome's logic
    const result = await this.chromeImporter.process(fileContent)

    // Update error messages to mention Edge instead of Chrome
    if (!result.success && result.errors) {
      result.errors = result.errors.map(error =>
        error.replace('Chrome CSV', 'Edge CSV'),
      )
    }

    return result
  }
}
