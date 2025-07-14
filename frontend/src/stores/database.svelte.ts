import type { DatabaseFile, Datum, OmitBasicDataExcept } from '@/types/datafile'

import Fuse from 'fuse.js'
import typia from 'typia'

import { DEFAULT_FUSE_CONFIG } from '@/consts/fuse'
import { DEFAULT_SETTINGS } from '@/consts/setting'

// Database state interface
interface DatabaseState {
  databaseFile: DatabaseFile
  initialized: boolean
  error: string | null
}

// Database store implementation using Svelte 5 state
class Database {
  // Core state
  private state = $state<DatabaseState>({
    databaseFile: {
      version: '1.0.0',
      settings: DEFAULT_SETTINGS,
      data: [],
    },
    initialized: false,
    error: null,
  })

  // Search index
  private fuse: Fuse<Datum> | null = null

  // Reactive getters
  get entries() {
    return this.state.databaseFile.data
  }

  get initialized() {
    return this.state.initialized
  }

  get error() {
    return this.state.error
  }

  // Initialize database
  async initialize(data?: DatabaseFile): Promise<void> {
    if (this.state.initialized) {
      this.close()
      this.state.initialized = false
    }

    this.state.error = null

    try {
      if (data != null) {
        const dbFile = typia.assert<DatabaseFile>(data)

        this.state.databaseFile = dbFile
      }
      else {
        // Create new empty database
        this.state.databaseFile = {
          version: '1.0.0',
          settings: DEFAULT_SETTINGS,
          data: [],
        }
      }

      // Initialize search
      this.updateSearchIndex()
      this.state.initialized = true
    }
    catch (error) {
      this.state.initialized = false
      console.error('Failed to parse database:', error)
      this.state.error = 'Failed to parse database. Data format is invalid.'
      throw new Error('Failed to parse database. Data format is invalid.')
    }
  }

  // Update search index
  private updateSearchIndex() {
    this.fuse = new Fuse(this.state.databaseFile.data, DEFAULT_FUSE_CONFIG)
  }

  // Add new entry
  addEntry(entry: OmitBasicDataExcept<Datum, 'TYPE'>): Datum {
    if (!this.state.initialized) {
      throw new Error('Database not initialized')
    }

    const newEntry: Datum = {
      ...entry,
      _id: crypto.randomUUID(),
      _isFavorite: false,
      _createdAt: new Date().toISOString(),
      _updatedAt: new Date().toISOString(),
      _lastUsedAt: new Date().toISOString(),
    }

    this.state.databaseFile.data.push(newEntry)
    this.updateSearchIndex()
    return newEntry
  }

  // Update existing entry
  updateEntry(id: string, updates: Partial<Omit<Datum, 'id'>>): Datum {
    if (!this.state.initialized) {
      throw new Error('Database not initialized')
    }

    const index = this.state.databaseFile.data.findIndex(entry => entry._id === id)
    if (index === -1) {
      throw new Error('Entry not found')
    }

    const updatedEntry = { ...this.state.databaseFile.data[index], ...updates }
    this.state.databaseFile.data[index] = updatedEntry
    this.updateSearchIndex()
    return updatedEntry
  }

  // Delete entry
  deleteEntry(id: string): void {
    if (!this.state.initialized) {
      throw new Error('Database not initialized')
    }

    const index = this.state.databaseFile.data.findIndex(entry => entry._id === id)
    if (index === -1) {
      throw new Error('Entry not found')
    }

    this.state.databaseFile.data.splice(index, 1)
    this.updateSearchIndex()
  }

  // Search entries
  searchEntries(searchTerm: string): Datum[] {
    if (!this.state.initialized) {
      return []
    }

    if (!searchTerm.trim() || !this.fuse) {
      return this.entries
    }

    const results = this.fuse.search(searchTerm)
    return results.map(result => result.item)
  }

  // Export database as JSON
  exportJSON(): string {
    if (!this.state.initialized) {
      throw new Error('Database not initialized')
    }

    // Return JSON string
    return JSON.stringify($state.snapshot(this.state.databaseFile))
  }

  // Close database
  close(): void {
    this.state.databaseFile = {
      version: '1.0.0',
      settings: DEFAULT_SETTINGS,
      data: [],
    }
    this.state.initialized = false
    this.state.error = null
    this.fuse = null
  }

  // Clear error
  clearError(): void {
    this.state.error = null
  }
}

// Create singleton instance
const database = new Database()

// Export the store instance
export { database }
