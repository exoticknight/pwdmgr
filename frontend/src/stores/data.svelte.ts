import type { Datum, OmitBasicDataExcept } from '@/types/data'

import Fuse from 'fuse.js'

import { DEFAULT_FUSE_CONFIG } from '@/consts/fuse'

// Data state interface
interface DataState {
  entries: Datum[]
  initialized: boolean
}

// Data store implementation using Svelte 5 state
class Data {
  #state = $state<DataState>({
    entries: [],
    initialized: false,
  })

  #fuse: Fuse<Datum> | null = null

  get entries() {
    return this.#state.entries
  }

  get initialized() {
    return this.#state.initialized
  }

  initialize(data: Datum[]) {
    if (this.#state.initialized) {
      this.reset()
      this.#state.initialized = false
    }

    this.#state.entries = data

    this.#updateSearchIndex()
    this.#state.initialized = true
  }

  #updateSearchIndex() {
    this.#fuse = new Fuse(this.#state.entries, DEFAULT_FUSE_CONFIG)
  }

  addEntry(entry: OmitBasicDataExcept<Datum, 'TYPE'>): Datum {
    if (!this.#state.initialized) {
      throw new Error('Data store not initialized')
    }

    const newEntry = {
      ...entry,
      _id: crypto.randomUUID(),
      _isFavorite: false,
      _createdAt: new Date().toISOString(),
      _updatedAt: new Date().toISOString(),
    }

    this.#state.entries.push(newEntry as Datum)
    this.#updateSearchIndex()
    return newEntry as Datum
  }

  updateEntry(id: string, updates: Partial<Omit<Datum, 'id'>>): Datum {
    if (!this.#state.initialized) {
      throw new Error('Data store not initialized')
    }

    const index = this.#state.entries.findIndex(entry => entry._id === id)
    if (index === -1) {
      throw new Error('Entry not found')
    }

    const updatedEntry = { ...this.#state.entries[index], ...updates }
    this.#state.entries[index] = updatedEntry as Datum
    this.#updateSearchIndex()
    return updatedEntry as Datum
  }

  deleteEntry(id: string): void {
    if (!this.#state.initialized) {
      throw new Error('Data store not initialized')
    }

    const index = this.#state.entries.findIndex(entry => entry._id === id)
    if (index === -1) {
      throw new Error('Entry not found')
    }

    this.#state.entries.splice(index, 1)
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

  export(): Datum[] {
    if (!this.#state.initialized) {
      throw new Error('Data store not initialized')
    }

    return $state.snapshot(this.#state.entries)
  }

  reset(): void {
    this.#state.entries = []
    this.#state.initialized = false
    this.#fuse = null
  }
}

// Create singleton instance
const data = new Data()

export { data }
