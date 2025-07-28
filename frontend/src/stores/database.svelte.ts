import type { Datum, OmitBasicDataExcept } from '@/types/data'
import type { DataFile } from '@/types/datafile'
import type { Setting } from '@/types/setting'

import Fuse from 'fuse.js'
import typia from 'typia'

import { DEFAULT_FUSE_CONFIG } from '@/consts/fuse'
import { DEFAULT_SETTINGS } from '@/consts/setting'
import { VERSION } from '@/consts/version'

// Database state interface
interface DataState {
  data: Datum[]
  setting: Setting
  initialized: boolean
  error: string | null
}

// Database store implementation using Svelte 5 state
class Database {
  #rawDataFile: DataFile | null = null

  #state = $state<DataState>({
    data: [],
    setting: DEFAULT_SETTINGS,
    initialized: false,
    error: null,
  })

  #fuse: Fuse<Datum> | null = null

  get entries() {
    return this.#state.data
  }

  get initialized() {
    return this.#state.initialized
  }

  get error() {
    return this.#state.error
  }

  async initialize(dataFile?: DataFile): Promise<void> {
    if (this.#state.initialized) {
      this.close()
      this.#state.initialized = false
    }

    this.#state.error = null

    try {
      if (dataFile != null) {
        this.#rawDataFile = dataFile

        // Validate the data structure
        const data = typia.assert<Datum[]>(dataFile.data)
        const settings = typia.assert<Partial<Setting>>(dataFile.setting ?? {})

        this.#state.data = data
        this.#state.setting = Object.assign({}, DEFAULT_SETTINGS, settings)
      }
      else {
        // Create new empty database
        this.#state.data = []
        this.#state.setting = DEFAULT_SETTINGS
      }

      this.#updateSearchIndex()
      this.#state.initialized = true
    }
    catch (error) {
      this.#state.initialized = false
      console.error('Failed to parse database:', error)
      this.#state.error = 'Failed to parse database. Data format is invalid.'
      throw new Error('Failed to parse database. Data format is invalid.')
    }
  }

  #updateSearchIndex() {
    this.#fuse = new Fuse(this.#state.data, DEFAULT_FUSE_CONFIG)
  }

  addEntry(entry: OmitBasicDataExcept<Datum, 'TYPE'>): Datum {
    if (!this.#state.initialized) {
      throw new Error('Database not initialized')
    }

    const newEntry: Datum = {
      ...entry,
      _id: crypto.randomUUID(),
      _isFavorite: false,
      _createdAt: new Date().toISOString(),
      _updatedAt: new Date().toISOString(),
      _lastUsedAt: null,
    }

    this.#state.data.push(newEntry)
    this.#updateSearchIndex()
    return newEntry
  }

  updateEntry(id: string, updates: Partial<Omit<Datum, 'id'>>): Datum {
    if (!this.#state.initialized) {
      throw new Error('Database not initialized')
    }

    const index = this.#state.data.findIndex(entry => entry._id === id)
    if (index === -1) {
      throw new Error('Entry not found')
    }

    const updatedEntry = { ...this.#state.data[index], ...updates }
    this.#state.data[index] = updatedEntry
    this.#updateSearchIndex()
    return updatedEntry
  }

  deleteEntry(id: string): void {
    if (!this.#state.initialized) {
      throw new Error('Database not initialized')
    }

    const index = this.#state.data.findIndex(entry => entry._id === id)
    if (index === -1) {
      throw new Error('Entry not found')
    }

    this.#state.data.splice(index, 1)
    this.#updateSearchIndex()
  }

  searchEntries(searchTerm: string): Datum[] {
    if (!this.#state.initialized) {
      return []
    }

    if (!searchTerm.trim() || !this.#fuse) {
      return this.entries
    }

    const results = this.#fuse.search(searchTerm)
    return results.map(result => result.item)
  }

  exportJSON(): DataFile {
    if (!this.#state.initialized) {
      throw new Error('Database not initialized')
    }

    return {
      version: VERSION,
      setting: $state.snapshot(this.#state.setting),
      data: $state.snapshot(this.#state.data),
    }
  }

  close(): void {
    this.#state.data = []
    this.#state.setting = DEFAULT_SETTINGS
    this.#state.initialized = false
    this.#state.error = null
    this.#fuse = null
  }

  clearError(): void {
    this.#state.error = null
  }
}

const database = new Database()

export { database }
