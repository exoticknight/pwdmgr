import type { BaseImporter, ImportEntry, ImportResult } from './types'

import type { PasswordData, TwoFactorAuthData } from '@/types/data'
import Papa from 'papaparse'
import { DataMetaType } from '@/types/data'

interface LastPassCSVRow {
  url?: string
  username?: string
  password?: string
  extra?: string
  name?: string
  grouping?: string
  fav?: string
  totp?: string
}

export class LastPassImporter implements BaseImporter {
  async process(fileContent: string): Promise<ImportResult> {
    try {
      const result = Papa.parse<LastPassCSVRow>(fileContent, {
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

          const title = row.name ?? row.grouping ?? row.url ?? `Imported Entry ${index + 1}`
          const username = row.username ?? ''
          const password = row.password ?? ''
          const url = row.url ?? ''
          const notes = row.extra ?? ''
          const totpSecret = row.totp ?? ''

          const passwordEntry: PasswordData = {
            _id: crypto.randomUUID(),
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

          entries.push(passwordEntry)

          if (totpSecret && totpSecret.trim().length > 0) {
            const totpEntry: TwoFactorAuthData = {
              _id: crypto.randomUUID(),
              _type: DataMetaType.TWO_FACTOR_AUTH,
              _isFavorite: false,
              _createdAt: now,
              _updatedAt: now,
              title: `${title} (TOTP)`,
              issuer: this.extractIssuerFromTitle(title),
              username,
              secret: totpSecret.trim(),
              algorithm: 'SHA1',
              digits: 6,
              period: 30,
              notes,
              serviceUrl: url,
            }

            entries.push(totpEntry)
          }
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
        errors: [`Failed to parse LastPass CSV: ${error instanceof Error ? error.message : 'Unknown error'}`],
      }
    }
  }

  private extractIssuerFromTitle(title: string): string {
    // Try to extract a meaningful issuer from the title
    // Common patterns: "Service Name", "Service - Account", "service.com"
    const cleanTitle = title.trim()

    // If title contains a domain, extract it
    const domainMatch = cleanTitle.match(/([a-z0-9-]+\.[a-z]{2,})/i)
    if (domainMatch) {
      return domainMatch[1]
    }

    // If title contains " - ", take the first part
    const dashSplit = cleanTitle.split(' - ')
    if (dashSplit.length > 1) {
      return dashSplit[0].trim()
    }

    // If title contains parentheses, take what's outside
    const parenMatch = cleanTitle.match(/^([^(]+)/)
    if (parenMatch) {
      return parenMatch[1].trim()
    }

    // Otherwise use the title as-is, or fallback
    return cleanTitle || 'Unknown'
  }
}
