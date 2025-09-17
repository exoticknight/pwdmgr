import type { BaseImporter, ImportEntry, ImportResult } from './types'

import { DataMetaType } from '@/types/data'

interface KeePassEntry {
  group?: string
  title?: string
  username?: string
  url?: string
  password?: string
  notes?: string
  uuid?: string
  image?: string
  creationTime?: string
  lastModTime?: string
  lastAccessTime?: string
  expireTime?: string
  expires?: boolean
}

export class KeePassImporter implements BaseImporter {
  async process(fileContent: string): Promise<ImportResult> {
    try {
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(fileContent, 'text/xml')

      // Check for parsing errors
      const parseError = xmlDoc.querySelector('parsererror')
      if (parseError) {
        return {
          success: false,
          count: 0,
          entries: [],
          errors: ['Invalid XML format'],
        }
      }

      const entryElements = xmlDoc.querySelectorAll('pwentry')

      if (entryElements.length === 0) {
        return {
          success: false,
          count: 0,
          entries: [],
          errors: ['No password entries found in XML file'],
        }
      }

      const entries: ImportEntry[] = []
      const errors: string[] = []

      for (const [index, entryElement] of Array.from(entryElements).entries()) {
        try {
          const entry = this.#parseEntry(entryElement)
          const now = new Date().toISOString()

          const title = entry.title ?? entry.group ?? entry.url ?? `Imported Entry ${index + 1}`
          const username = entry.username ?? ''
          const password = entry.password ?? ''
          const url = entry.url ?? ''
          const notes = this.#buildNotes(entry)

          const passwordEntry = {
            _type: DataMetaType.PASSWORD,
            _isFavorite: false,
            _createdAt: (entry.creationTime != null && entry.creationTime.length > 0) ? this.#parseDateTime(entry.creationTime) : now,
            _updatedAt: (entry.lastModTime != null && entry.lastModTime.length > 0) ? this.#parseDateTime(entry.lastModTime) : now,
            title,
            username,
            password,
            notes,
            url,
          }

          entries.push(passwordEntry)
        }
        catch (error) {
          errors.push(`Entry ${index + 1}: ${error instanceof Error ? error.message : 'parsing error'}`)
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
        errors: [`Failed to parse KeePass XML: ${error instanceof Error ? error.message : 'Unknown error'}`],
      }
    }
  }

  #parseEntry(entryElement: Element): KeePassEntry {
    const entry: KeePassEntry = {}

    // Parse group - handle both simple and tree structure
    const groupElement = entryElement.querySelector('group')
    if (groupElement != null) {
      const treeAttr = groupElement.getAttribute('tree')
      if (treeAttr != null && treeAttr.length > 0) {
        // Tree format: "General>Windows"
        const groupText = groupElement.textContent?.trim() ?? ''
        entry.group = `${treeAttr}>${groupText}`
      }
      else {
        entry.group = groupElement.textContent?.trim() ?? ''
      }
    }

    // Parse other fields
    entry.title = this.#getElementText(entryElement, 'title')
    entry.username = this.#getElementText(entryElement, 'username')
    entry.url = this.#getElementText(entryElement, 'url')
    entry.password = this.#getElementText(entryElement, 'password')
    entry.notes = this.#getElementText(entryElement, 'notes')
    entry.uuid = this.#getElementText(entryElement, 'uuid')
    entry.image = this.#getElementText(entryElement, 'image')
    entry.creationTime = this.#getElementText(entryElement, 'creationtime')
    entry.lastModTime = this.#getElementText(entryElement, 'lastmodtime')
    entry.lastAccessTime = this.#getElementText(entryElement, 'lastaccesstime')

    const expiretimeElement = entryElement.querySelector('expiretime')
    if (expiretimeElement != null) {
      entry.expireTime = expiretimeElement.textContent?.trim() ?? ''
      entry.expires = (expiretimeElement.getAttribute('expires') ?? 'false') === 'true'
    }

    return entry
  }

  #getElementText(parent: Element, tagName: string): string | undefined {
    const element = parent.querySelector(tagName)
    const text = element?.textContent?.trim()
    return (text != null && text.length > 0) ? text : undefined
  }

  #buildNotes(entry: KeePassEntry): string {
    const notes: string[] = []

    if (entry.notes != null && entry.notes.length > 0) {
      notes.push(entry.notes)
    }

    if (entry.group != null && entry.group.length > 0) {
      notes.push(`Group: ${entry.group}`)
    }

    if (entry.expires === true && (entry.expireTime != null && entry.expireTime.length > 0)) {
      const expireDate = this.#parseDateTime(entry.expireTime)
      notes.push(`Expires: ${new Date(expireDate).toLocaleDateString()}`)
    }

    if (entry.uuid != null && entry.uuid.length > 0) {
      notes.push(`UUID: ${entry.uuid}`)
    }

    return notes.join('\n\n')
  }

  #parseDateTime(dateTimeString: string): string {
    try {
      // KeePass format: "2006-12-31T11:52:01"
      const date = new Date(dateTimeString)
      return date.toISOString()
    }
    catch {
      return new Date().toISOString()
    }
  }
}
