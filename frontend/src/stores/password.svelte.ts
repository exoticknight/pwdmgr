import type { PasswordEntry, SearchConfig } from '../types/password'
import Fuse from 'fuse.js'

interface PasswordState {
  entries: PasswordEntry[]
  searchTerm: string
  hasUnsavedChanges: boolean
  showPasswords: Record<string, boolean>
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

export class PasswordManager {
  private state = $state<PasswordState>({
    entries: [],
    searchTerm: '',
    hasUnsavedChanges: false,
    showPasswords: {},
  })

  private fuse: Fuse<PasswordEntry> | null = null

  constructor(private searchConfig: SearchConfig = DEFAULT_SEARCH_CONFIG) {
    this.initializeFuse()
  }

  // Getters
  get entries() { return this.state.entries }
  get searchTerm() { return this.state.searchTerm }
  get hasUnsavedChanges() { return this.state.hasUnsavedChanges }
  get showPasswords() { return this.state.showPasswords }

  // Get filtered entries
  get filteredEntries(): PasswordEntry[] {
    if (!this.state.searchTerm || !this.fuse) {
      return this.state.entries
    }

    const results = this.fuse.search(this.state.searchTerm)
    return results.map(result => result.item)
  }

  // Actions
  setEntries(entries: PasswordEntry[]) {
    this.state.entries = entries
    this.updateFuseInstance()
  }

  setSearchTerm(term: string) {
    this.state.searchTerm = term
  }

  addEntry(entry: PasswordEntry) {
    this.state.entries = [...this.state.entries, entry]
    this.markAsChanged()
    this.updateFuseInstance()
  }

  updateEntry(id: string, updates: Partial<PasswordEntry>) {
    this.state.entries = this.state.entries.map(entry =>
      entry.id === id ? { ...entry, ...updates } : entry,
    )
    this.markAsChanged()
    this.updateFuseInstance()
  }

  deleteEntry(id: string) {
    this.state.entries = this.state.entries.filter(entry => entry.id !== id)
    this.markAsChanged()
    this.updateFuseInstance()
  }

  togglePasswordVisibility(id: string) {
    this.state.showPasswords[id] = !this.state.showPasswords[id]
  }

  markAsSaved() {
    this.state.hasUnsavedChanges = false
  }

  private markAsChanged() {
    this.state.hasUnsavedChanges = true
  }

  private initializeFuse() {
    this.fuse = new Fuse(this.state.entries, this.searchConfig)
  }

  private updateFuseInstance() {
    if (this.fuse) {
      this.fuse.setCollection(this.state.entries)
    }
    else {
      this.initializeFuse()
    }
  }
}
