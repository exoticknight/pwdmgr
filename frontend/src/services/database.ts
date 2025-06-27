import type { PasswordEntry, SearchConfig } from '../types/password'
import Fuse from 'fuse.js'

// Database file structure (plain JSON)
interface DatabaseFile {
  version: string
  entries: PasswordEntry[]
  metadata: {
    createdAt: string
    updatedAt: string
  }
}

const DEFAULT_SEARCH_CONFIG: SearchConfig = {
  keys: [
    { name: 'title', weight: 0.5 },
    { name: 'username', weight: 0.3 },
    { name: 'url', weight: 0.2 },
    { name: 'notes', weight: 0.1 },
  ],
  threshold: 0.4,
  includeScore: true,
  ignoreLocation: true,
  shouldSort: true,
}

// Enhanced database service interface with search functionality
export interface DatabaseService {
  // Core database operations
  initialize: (data?: string) => Promise<void>
  getAllEntries: () => Promise<PasswordEntry[]>
  addEntry: (entry: Omit<PasswordEntry, 'id'>) => Promise<PasswordEntry>
  updateEntry: (id: string, updates: Partial<PasswordEntry>) => Promise<PasswordEntry>
  deleteEntry: (id: string) => Promise<void>
  exportJSON: () => Promise<string>
  close: () => void

  // Search functionality
  setSearchTerm: (term: string) => void
  getSearchTerm: () => string
  getFilteredEntries: () => PasswordEntry[]

  // Change tracking
  hasUnsavedChanges: () => boolean
  markAsSaved: () => void
}

// JSON database implementation with search functionality
class JSONDatabase implements DatabaseService {
  private entries: PasswordEntry[] = []
  private initialized = false
  private searchTerm = ''
  private fuse: Fuse<PasswordEntry> | null = null
  private unsavedChanges = false

  async initialize(data?: string): Promise<void> {
    if (this.initialized) {
      return
    }

    if (data != null && data.trim()) {
      try {
        // Parse JSON data
        const dbFile: unknown = JSON.parse(data)

        // Validate data structure
        if (typeof dbFile !== 'object' || !Array.isArray((dbFile as DatabaseFile).entries)) {
          throw new TypeError('Invalid database format')
        }

        this.entries = (dbFile as DatabaseFile).entries
      }
      catch (error) {
        console.error('Failed to parse database:', error)
        throw new Error('Failed to parse database. Data format is invalid.')
      }
    }
    else {
      // Create new empty database
      this.entries = []
    }

    // Initialize search
    this.updateSearchIndex()
    this.unsavedChanges = false
    this.initialized = true
  }

  private updateSearchIndex() {
    this.fuse = new Fuse(this.entries, DEFAULT_SEARCH_CONFIG)
  }

  async getAllEntries(): Promise<PasswordEntry[]> {
    if (!this.initialized) {
      throw new Error('Database not initialized')
    }
    return [...this.entries].sort((a, b) => a.title.localeCompare(b.title))
  }

  async addEntry(entry: Omit<PasswordEntry, 'id'>): Promise<PasswordEntry> {
    if (!this.initialized) {
      throw new Error('Database not initialized')
    }

    const newEntry: PasswordEntry = {
      id: crypto.randomUUID(),
      ...entry,
    }

    this.entries.push(newEntry)
    this.updateSearchIndex()
    this.unsavedChanges = true
    return newEntry
  }

  async updateEntry(id: string, updates: Partial<PasswordEntry>): Promise<PasswordEntry> {
    if (!this.initialized) {
      throw new Error('Database not initialized')
    }

    const index = this.entries.findIndex(entry => entry.id === id)
    if (index === -1) {
      throw new Error('Entry not found')
    }

    const updatedEntry = { ...this.entries[index], ...updates }
    this.entries[index] = updatedEntry
    this.updateSearchIndex()
    this.unsavedChanges = true
    return updatedEntry
  }

  async deleteEntry(id: string): Promise<void> {
    if (!this.initialized) {
      throw new Error('Database not initialized')
    }

    const index = this.entries.findIndex(entry => entry.id === id)
    if (index === -1) {
      throw new Error('Entry not found')
    }

    this.entries.splice(index, 1)
    this.updateSearchIndex()
    this.unsavedChanges = true
  }

  async exportJSON(): Promise<string> {
    if (!this.initialized) {
      throw new Error('Database not initialized')
    }

    // Create database file structure
    const dbFile: DatabaseFile = {
      version: '1.0.0',
      entries: this.entries,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    }

    // Return JSON string
    return JSON.stringify(dbFile, null, 2)
  }

  // Search functionality
  setSearchTerm(term: string): void {
    this.searchTerm = term
  }

  getSearchTerm(): string {
    return this.searchTerm
  }

  getFilteredEntries(): PasswordEntry[] {
    if (!this.initialized) {
      return []
    }

    if (!this.searchTerm || !this.fuse) {
      return [...this.entries].sort((a, b) => a.title.localeCompare(b.title))
    }

    const results = this.fuse.search(this.searchTerm)
    return results.map(result => result.item)
  }

  // Change tracking
  hasUnsavedChanges(): boolean {
    return this.unsavedChanges
  }

  markAsSaved(): void {
    this.unsavedChanges = false
  }

  close(): void {
    this.entries = []
    this.fuse = null
    this.searchTerm = ''
    this.unsavedChanges = false
    this.initialized = false
  }
}

// Singleton instance
let databaseInstance: JSONDatabase | null = null

export async function getDatabaseService(): Promise<DatabaseService> {
  if (!databaseInstance) {
    databaseInstance = new JSONDatabase()
  }
  return databaseInstance
}

export function resetDatabaseService(): void {
  if (databaseInstance) {
    databaseInstance.close()
    databaseInstance = null
  }
}
