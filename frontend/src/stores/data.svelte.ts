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
  #clusterIndex = new Map<string, Set<string>>()

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
    this.#buildClusterIndex()

    this.#updateSearchIndex()
    this.#state.initialized = true
  }

  #buildClusterIndex() {
    this.#clusterIndex.clear()
    for (const entry of this.#state.entries) {
      if (entry._clusterId) {
        if (!this.#clusterIndex.has(entry._clusterId)) {
          this.#clusterIndex.set(entry._clusterId, new Set())
        }
        this.#clusterIndex.get(entry._clusterId)!.add(entry._id)
      }
    }
  }

  #addToClusterIndex(entry: Datum) {
    if (entry._clusterId) {
      if (!this.#clusterIndex.has(entry._clusterId)) {
        this.#clusterIndex.set(entry._clusterId, new Set())
      }
      this.#clusterIndex.get(entry._clusterId)!.add(entry._id)
    }
  }

  #removeFromClusterIndex(entry: Datum) {
    if (entry._clusterId && this.#clusterIndex.has(entry._clusterId)) {
      const cluster = this.#clusterIndex.get(entry._clusterId)!
      cluster.delete(entry._id)
      if (cluster.size === 0) {
        this.#clusterIndex.delete(entry._clusterId)
      }
    }
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
    this.#addToClusterIndex(newEntry as Datum)
    this.#updateSearchIndex()
    return newEntry as Datum
  }

  addEntries(entries: Omit<Datum, '_id'>[]) {
    const newEntries = entries.map(entry => ({
      ...entry,
      _id: crypto.randomUUID(),
    })) as Datum[]

    this.#state.entries.push(...newEntries)
    newEntries.forEach(e => this.#addToClusterIndex(e))
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

    // Update cluster index if cluster ID changed
    if (oldEntry._clusterId !== updatedEntry._clusterId) {
      this.#removeFromClusterIndex(oldEntry)
      this.#addToClusterIndex(updatedEntry as Datum)
    }

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

    const entry = this.#state.entries[index]
    this.#removeFromClusterIndex(entry)
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

  getClusterItems(clusterId: string): Datum[] {
    if (!clusterId || !this.#clusterIndex.has(clusterId)) {
      return []
    }
    const ids = this.#clusterIndex.get(clusterId)!
    // Map IDs to entries. Since we don't have an ID index, we have to find them.
    // Optimization: If we had an ID index map, this would be O(N_cluster).
    // Currently O(N_cluster * N_total).
    // Given the constraints, iterating entries is okay-ish if N is small, but maintaining an ID map is better.
    // However, I will stick to iterating entries and checking ID set for correctness/simplicity unless performance is critical.
    // Actually, `entries` is an array. I can just filter.
    return this.#state.entries.filter(e => ids.has(e._id))
  }

  linkItems(sourceId: string, targetId: string) {
    const sourceIndex = this.#state.entries.findIndex(e => e._id === sourceId)
    const targetIndex = this.#state.entries.findIndex(e => e._id === targetId)

    if (sourceIndex === -1 || targetIndex === -1)
      return

    const source = this.#state.entries[sourceIndex]
    const target = this.#state.entries[targetIndex]

    let newClusterId = target._clusterId

    if (!newClusterId) {
      if (source._clusterId) {
        // If target has no cluster, but source does, target joins source's cluster?
        // Prompt: "If associated item (B/Target) already has cluster, A joins it. If not, create new."
        // So if B has NO cluster, we create a NEW one. Even if A has a cluster.
        // Wait, if A has a cluster, and B doesn't. If we create a new one, A leaves its old cluster.
        // This seems correct per prompt "If not (has cluster), create a new one".
        newClusterId = crypto.randomUUID()
      }
 else {
        // Both have no cluster
        newClusterId = crypto.randomUUID()
      }
    }

    // Update both
    if (source._clusterId !== newClusterId) {
      this.updateEntry(sourceId, { _clusterId: newClusterId, _updatedAt: new Date().toISOString() })
    }
    if (target._clusterId !== newClusterId) {
      this.updateEntry(targetId, { _clusterId: newClusterId, _updatedAt: new Date().toISOString() })
    }
  }

  unlinkItem(id: string) {
    const index = this.#state.entries.findIndex(e => e._id === id)
    if (index === -1)
return

    // Just set clusterId to undefined/null
    // Note: types/data.ts says _clusterId?: string.
    // Partial update allows setting it to undefined?
    // Typescript might complain if we pass undefined to a partial if exactOptionalPropertyTypes is on,
    // but usually it's fine. I'll cast if needed.
    this.updateEntry(id, { _clusterId: undefined, _updatedAt: new Date().toISOString() })
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
    this.#clusterIndex.clear()
  }
}

// Create singleton instance
const data = new Data()

export { data }
