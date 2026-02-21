interface AppState {
  hasDataUnsavedChanges: boolean
  hasSettingUnsavedChanges: boolean
  dbPath: string
}

class AppStore {
  #state = $state<AppState>({
    hasDataUnsavedChanges: false,
    hasSettingUnsavedChanges: false,
    dbPath: '',
  })

  get hasDataUnsavedChanges() {
    return this.#state.hasDataUnsavedChanges
  }

  get hasSettingUnsavedChanges() {
    return this.#state.hasSettingUnsavedChanges
  }

  get dbPath(): string {
    return this.#state.dbPath
  }

  set dbPath(value: string) {
    this.#state.dbPath = value
  }

  markDataAsUnsaved(): void {
    this.#state.hasDataUnsavedChanges = true
  }

  markDataAsSaved(): void {
    this.#state.hasDataUnsavedChanges = false
  }

  markSettingAsUnsaved(): void {
    this.#state.hasSettingUnsavedChanges = true
  }

  markSettingAsSaved(): void {
    this.#state.hasSettingUnsavedChanges = false
  }

  reset(): void {
    this.#state.hasDataUnsavedChanges = false
    this.#state.hasSettingUnsavedChanges = false
    this.#state.dbPath = ''
  }
}

// Create singleton instance
const app = new AppStore()

// Export the store instance
export { app }
