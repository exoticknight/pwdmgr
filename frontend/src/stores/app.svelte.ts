// Application-level state management
// This store manages UI state and application-level concerns

interface AppState {
  hasUnsavedChanges: boolean
}

class AppStore {
  #state = $state<AppState>({
    hasUnsavedChanges: false,
  })

  // Reactive getters
  get hasUnsavedChanges() {
    return this.#state.hasUnsavedChanges
  }

  // Methods to manage unsaved changes
  markAsUnsaved(): void {
    this.#state.hasUnsavedChanges = true
  }

  markAsSaved(): void {
    this.#state.hasUnsavedChanges = false
  }

  // Reset state (useful when navigating away)
  reset(): void {
    this.#state.hasUnsavedChanges = false
  }
}

// Create singleton instance
const appStore = new AppStore()

// Export the store instance
export { appStore }
