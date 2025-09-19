import type { BaseImporter, ImportEntry, ImportResult } from './types'
import Papa from 'papaparse'
import { DataMetaType } from '@/types/data'

interface ChromeCSVRow {
  name?: string
  url?: string
  username?: string
  password?: string
  note?: string
}

export class ChromeImporter implements BaseImporter {
  async process(fileContent: string): Promise<ImportResult> {
    try {
      const result = Papa.parse<ChromeCSVRow>(fileContent, {
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

          const title = this.#getTitle(row, index)
          const username = row.username ?? ''
          const password = row.password ?? ''
          const url = row.url ?? ''

          // Preserve original name in notes if it exists
          let notes = row.note ?? ''
          if (row.name && row.name.trim() !== '') {
            const originalName = `Original name: ${row.name.trim()}`
            notes = notes ? `${notes}\n\n${originalName}` : originalName
          }

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
        errors: [`Failed to parse Chrome CSV: ${error instanceof Error ? error.message : 'Unknown error'}`],
      }
    }
  }

  #getTitle(row: ChromeCSVRow, index: number): string {
    if (row.name && row.name.trim() !== '') {
      return this.#extractBrandFromUrl(row.name.trim())
    }
    if (row.url && row.url.trim() !== '') {
      return this.#extractBrandFromUrl(row.url.trim())
    }
    if (row.username && row.username.trim() !== '') {
      return row.username.trim()
    }
    return `Imported Entry ${index + 1}`
  }

  #extractBrandFromUrl(urlString: string): string {
    try {
      // Check if string contains non-Latin characters (IDN domains)
      // Allow ASCII letters, numbers, dots, hyphens, colons, and slashes
      if (!/^[\w.\-:/]+$/.test(urlString)) {
        return urlString
      }

      // Add http:// if no protocol is present
      let normalizedUrl = urlString
      if (!urlString.includes('://')) {
        normalizedUrl = `http://${urlString}`
      }

      const urlObj = new URL(normalizedUrl)
      const hostname = urlObj.hostname

      // Handle IP address cases
      if (this.#isIPAddress(hostname)) {
        // For IP addresses, return IP:port format or just IP
        const port = urlObj.port
        return port ? `${hostname}:${port}` : hostname
      }

      const parts = hostname.split('.')
      if (parts.length >= 2) {
        // For 3 parts: check if last two parts form a two-part TLD
        // e.g., google.co.uk -> parts: [google, co, uk]
        if (parts.length === 3 && this.#isTwoPartTLD(parts.slice(-2).join('.'))) {
          return parts[0]
        }

        // Default: return second-to-last part (remove common suffix, take last brand part)
        // e.g., google.com -> google, mail.google.com -> google, 163.com -> 163
        return parts[parts.length - 2]
      }

      // If only one part, return it directly
      return parts[0] || hostname
    }
    catch {
      // If URL parsing fails, return original string
      return urlString
    }
  }

  #isIPAddress(hostname: string): boolean {
    // Simple IPv4 detection
    const ipv4Regex = /^(?:\d{1,3}\.){3}\d{1,3}$/
    // Simple IPv6 detection
    const ipv6Regex = /^(?:[0-9a-f]{0,4}:){1,7}[0-9a-f]{0,4}$/i
    return ipv4Regex.test(hostname) || ipv6Regex.test(hostname)
  }

  #isTwoPartTLD(tld: string): boolean {
    // Heuristic approach to detect two-part TLD
    const parts = tld.split('.')
    if (parts.length !== 2) {
      return false
    }

    const [first, second] = parts

    // Common patterns for two-part TLDs:
    // 1. First part is 2-3 characters (co, gov, edu, org, net, ac, com, etc.)
    // 2. Second part is 2-3 characters (country codes like uk, jp, cn, au, etc.)
    const isFirstPartValid = first.length >= 2 && first.length <= 3
    const isSecondPartValid = second.length >= 2 && second.length <= 3

    // Additional check: common first parts
    const commonFirstParts = ['co', 'gov', 'edu', 'org', 'net', 'ac', 'com', 'ne', 'or', 'gr', 'go', 'lg']
    const hasCommonFirstPart = commonFirstParts.includes(first.toLowerCase())

    return isFirstPartValid && isSecondPartValid && hasCommonFirstPart
  }
}
