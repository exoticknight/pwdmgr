import type { PasswordEntry, SearchConfig } from '../types/password'
import Fuse from 'fuse.js'

// Database file structure (plain JSON)
interface DatabaseFile {
  version: string
  entries: PasswordEntry[]
}

const DEFAULT_SEARCH_CONFIG: SearchConfig = {
  keys: [
    { name: 'title', weight: 0.5 },
    { name: 'username', weight: 0.3 },
    { name: 'url', weight: 0.2 },
    { name: 'notes', weight: 0.1 },
  ],
  threshold: 0.4,
  includeScore: false,
  ignoreLocation: true,
  shouldSort: true,
}

// Database service interface
export interface DatabaseService {
  // Core database operations
  initialize: (data?: string) => void
  getAllEntries: () => PasswordEntry[]
  addEntry: (entry: Omit<PasswordEntry, 'id'>) => PasswordEntry
  updateEntry: (id: string, updates: Partial<PasswordEntry>) => PasswordEntry
  deleteEntry: (id: string) => void
  exportJSON: () => string
  close: () => void

  // Search functionality
  getFilteredEntries: (searchTerm: string) => PasswordEntry[]

  // Subscription for reactive updates
  subscribe: (callback: () => void) => () => void
}

// JSON database implementation
class JSONDatabase implements DatabaseService {
  private entries: PasswordEntry[] = []
  private initialized = false
  private fuse: Fuse<PasswordEntry> | null = null
  private subscribers: (() => void)[] = [] // Callbacks to notify on changes

  initialize(data?: string) {
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
    this.initialized = true
    this.notifySubscribers()
  }

  private updateSearchIndex() {
    this.fuse = new Fuse(this.entries, DEFAULT_SEARCH_CONFIG)
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback())
  }

  subscribe(callback: () => void): () => void {
    this.subscribers.push(callback)
    // Return unsubscribe function
    return () => {
      const index = this.subscribers.indexOf(callback)
      if (index > -1) {
        this.subscribers.splice(index, 1)
      }
    }
  }

  getAllEntries(): PasswordEntry[] {
    if (!this.initialized) {
      throw new Error('Database not initialized')
    }
    return [...this.entries].sort((a, b) => a.title.localeCompare(b.title))
  }

  addEntry(entry: Omit<PasswordEntry, 'id'>): PasswordEntry {
    if (!this.initialized) {
      throw new Error('Database not initialized')
    }

    const newEntry: PasswordEntry = {
      id: crypto.randomUUID(),
      ...entry,
    }

    this.entries.push(newEntry)
    this.updateSearchIndex()
    this.notifySubscribers()
    return newEntry
  }

  updateEntry(id: string, updates: Partial<PasswordEntry>): PasswordEntry {
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
    this.notifySubscribers()
    return updatedEntry
  }

  deleteEntry(id: string) {
    if (!this.initialized) {
      throw new Error('Database not initialized')
    }

    const index = this.entries.findIndex(entry => entry.id === id)
    if (index === -1) {
      throw new Error('Entry not found')
    }

    this.entries.splice(index, 1)
    this.updateSearchIndex()
    this.notifySubscribers()
  }

  // Reactive search that takes searchTerm as parameter instead of storing it
  getFilteredEntries(searchTerm: string): PasswordEntry[] {
    if (!this.initialized) {
      return []
    }

    if (!searchTerm.trim() || !this.fuse) {
      return [...this.entries].sort((a, b) => a.title.localeCompare(b.title))
    }

    const results = this.fuse.search(searchTerm)
    return results.map(result => result.item)
  }

  exportJSON(): string {
    if (!this.initialized) {
      throw new Error('Database not initialized')
    }

    // Create database file structure
    const dbFile: DatabaseFile = {
      version: '1.0.0',
      entries: this.entries,
    }

    // Return JSON string
    return JSON.stringify(dbFile, null, 2)
  }

  close(): void {
    this.entries = []
    this.fuse = null
    this.initialized = false
    this.subscribers = []
  }
}

// Singleton instance
let databaseInstance: JSONDatabase | null = null

export function getDatabaseService(): DatabaseService {
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
