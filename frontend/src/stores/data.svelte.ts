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

  addEntries(entries: Omit<Datum, '_id'>[]) {
    const newEntries = entries.map(entry => ({
      ...entry,
      _id: crypto.randomUUID(),
    })) as Datum[]

    this.#state.entries.push(...newEntries)
    this.#updateSearchIndex()
  }

  updateEntry(id: string, updates: Partial<Omit<Datum, 'id'>>): Datum {
    if (!this.#state.initialized) {
      throw new Error('Data store not initialized')
    }

    const index = this.#state.entries.findIndex(entry => entry._id === id)
    if (index === -1) {
      throw new Error('Entry not found')
    }

    const oldEntry = this.#state.entries[index]
    const updatedEntry = { ...oldEntry, ...updates }

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

  getLinkedItems(id: string): Datum[] {
    const entry = this.#state.entries.find(e => e._id === id)
    if (!entry || !entry._links || entry._links.length === 0) {
      return []
    }
    const linkedSet = new Set(entry._links)
    return this.#state.entries.filter(e => linkedSet.has(e._id))
  }

  linkItems(sourceId: string, targetId: string) {
    const sourceIndex = this.#state.entries.findIndex(e => e._id === sourceId)
    const targetIndex = this.#state.entries.findIndex(e => e._id === targetId)

    if (sourceIndex === -1 || targetIndex === -1)
      return

    const source = this.#state.entries[sourceIndex]
    const target = this.#state.entries[targetIndex]

    const sourceLinks = Array.isArray(source._links) ? source._links.slice() : []
    const targetLinks = Array.isArray(target._links) ? target._links.slice() : []

    if (!sourceLinks.includes(targetId)) {
      sourceLinks.push(targetId)
    }
    if (!targetLinks.includes(sourceId)) {
      targetLinks.push(sourceId)
    }

    const now = new Date().toISOString()
    this.updateEntry(sourceId, { _links: sourceLinks, _updatedAt: now })
    this.updateEntry(targetId, { _links: targetLinks, _updatedAt: now })
  }

  unlinkItems(sourceId: string, targetId: string) {
    const sourceIndex = this.#state.entries.findIndex(e => e._id === sourceId)
    const targetIndex = this.#state.entries.findIndex(e => e._id === targetId)

    if (sourceIndex === -1 || targetIndex === -1)
      return

    const source = this.#state.entries[sourceIndex]
    const target = this.#state.entries[targetIndex]

    const sourceLinks = Array.isArray(source._links) ? source._links.filter(id => id !== targetId) : []
    const targetLinks = Array.isArray(target._links) ? target._links.filter(id => id !== sourceId) : []

    const now = new Date().toISOString()
    this.updateEntry(sourceId, { _links: sourceLinks, _updatedAt: now })
    this.updateEntry(targetId, { _links: targetLinks, _updatedAt: now })
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
