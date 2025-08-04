// Application-level state management
// This store manages UI state and application-level concerns

interface AppState {
  hasDataUnsavedChanges: boolean
  hasSettingUnsavedChanges?: boolean
}

class AppStore {
  #state = $state<AppState>({
    hasDataUnsavedChanges: false,
    hasSettingUnsavedChanges: false,
  })

  get hasDataUnsavedChanges() {
    return this.#state.hasDataUnsavedChanges
  }

  get hasSettingUnsavedChanges() {
    return this.#state.hasSettingUnsavedChanges
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
  }
}

// Create singleton instance
const app = new AppStore()

// Export the store instance
export { app }
