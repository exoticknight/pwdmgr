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
    return this.#state.entries.filter(e => ids.has(e._id))
  }

  linkItems(sourceId: string, targetId: string) {
    const sourceIndex = this.#state.entries.findIndex(e => e._id === sourceId)
    const targetIndex = this.#state.entries.findIndex(e => e._id === targetId)

    if (sourceIndex === -1 || targetIndex === -1)
      return

    const source = this.#state.entries[sourceIndex]
    const target = this.#state.entries[targetIndex]

    const sourceCluster = source._clusterId
    const targetCluster = target._clusterId

    // Case 1: both have no cluster -> create a new one and assign to both
    if (!sourceCluster && !targetCluster) {
      const newClusterId = crypto.randomUUID()
      this.updateEntry(sourceId, { _clusterId: newClusterId, _updatedAt: new Date().toISOString() })
      this.updateEntry(targetId, { _clusterId: newClusterId, _updatedAt: new Date().toISOString() })
      return
    }

    // Case 2: source has cluster, target doesn't -> target joins source's cluster
    if (sourceCluster && !targetCluster) {
      this.updateEntry(targetId, { _clusterId: sourceCluster, _updatedAt: new Date().toISOString() })
      return
    }

    // Case 3: target has cluster, source doesn't -> source joins target's cluster
    if (!sourceCluster && targetCluster) {
      this.updateEntry(sourceId, { _clusterId: targetCluster, _updatedAt: new Date().toISOString() })
      return
    }

    // Case 4: both have the same cluster -> nothing to do
    if (sourceCluster === targetCluster) {
      return
    }

    // Case 5: both have different clusters -> merge target's cluster into source's cluster
    // Choose source's cluster ID as the final cluster ID
    const finalClusterId = sourceCluster!
    const toMergeClusterId = targetCluster!
    const membersToMerge = this.getClusterItems(toMergeClusterId).map(e => e._id)
    for (const id of membersToMerge) {
      this.updateEntry(id, { _clusterId: finalClusterId, _updatedAt: new Date().toISOString() })
    }
  }

  unlinkItem(id: string) {
    const index = this.#state.entries.findIndex(e => e._id === id)
    if (index === -1)
      return

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
