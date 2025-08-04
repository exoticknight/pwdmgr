import type { DeepPaths, DeepValue } from '@/types/deep-access'
import type { Setting } from '@/types/setting'
import { DEFAULT_SETTINGS } from '@/consts/setting'

// Setting state interface
interface SettingState {
  data: Setting
  initialized: boolean
}

// Setting store class - direct implementation, no dependency on generic base class
class SettingStore {
  #state = $state<SettingState>({
    data: DEFAULT_SETTINGS,
    initialized: false,
  })

  // Reactive getter - returns current data
  get data(): Setting {
    return this.#state.data
  }

  // Check if initialized
  get initialized(): boolean {
    return this.#state.initialized
  }

  // Initialize settings - supports passing partial settings for merging
  initialize(settings?: Partial<Setting>): void {
    if (settings) {
      // Deep merge settings, ensure all default values exist
      this.#state.data = this.#deepMerge($state.snapshot(this.#state.data), settings)
    }
    else {
      // Use default settings
      this.#state.data = DEFAULT_SETTINGS
    }
    this.#state.initialized = true
  }

  getSetting<K extends keyof Setting>(key: K): Setting[K]
  getSetting<P extends DeepPaths<Setting>>(path: P): DeepValue<Setting, P>
  getSetting<R>(path: string, defaultValue: R): R
  getSetting(keyOrPath: unknown, defaultValue?: unknown): unknown {
    if (!this.#state.initialized) {
      return defaultValue
    }

    const pathStr = String(keyOrPath)
    if (pathStr.includes('.')) {
      // Handle nested path
      return this.#getNestedValue(this.#state.data, pathStr, defaultValue)
    }
    else {
      // Handle top-level property
      const typedData = this.#state.data as unknown as Record<string, unknown>
      const value = typedData[pathStr]
      return value !== undefined ? value : defaultValue
    }
  }

  updateSetting<K extends keyof Setting>(key: K, value: Setting[K]): void
  updateSetting<P extends DeepPaths<Setting>>(path: P, value: DeepValue<Setting, P>): void
  updateSetting(keyOrPath: unknown, value: unknown): void {
    if (!this.#state.initialized) {
      throw new Error('Setting store not initialized')
    }

    const pathStr = String(keyOrPath)
    if (pathStr.includes('.')) {
      // Handle nested path
      this.#setNestedValue(this.#state.data, pathStr, value)
    }
    else {
      // Handle top-level property
      const typedData = this.#state.data as unknown as Record<string, unknown>
      typedData[pathStr] = value
    }
  }

  // Batch update settings
  updateSettings(updates: Partial<Setting>): void {
    if (!this.#state.initialized) {
      throw new Error('Setting store not initialized')
    }

    this.#state.data = this.#deepMerge(this.#state.data, updates)
  }

  // Reset settings
  reset(): void {
    this.#state.data = DEFAULT_SETTINGS
    this.#state.initialized = false
  }

  // Export settings (for persistence)
  export(): Setting {
    if (!this.#state.initialized) {
      throw new Error('Setting store not initialized')
    }

    return $state.snapshot(this.#state.data)
  }

  // Private method: deep merge objects
  #deepMerge<A, B>(target: A, source: B): A & B {
    const result = { ...target } as Record<string, unknown>

    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        const sourceValue = source[key]
        const targetValue = result[key]

        if (
          sourceValue !== null
          && typeof sourceValue === 'object'
          && !Array.isArray(sourceValue)
          && targetValue !== null
          && typeof targetValue === 'object'
          && !Array.isArray(targetValue)
        ) {
          // Recursively merge nested objects
          result[key] = this.#deepMerge(targetValue, sourceValue)
        }
        else {
          // Direct assignment
          result[key] = sourceValue
        }
      }
    }

    return result as A & B
  }

  // Private method: set nested value
  #setNestedValue(obj: unknown, path: string, value: unknown): void {
    const keys = path.split('.')
    let current = obj as Record<string, unknown>

    // Traverse to the parent object of the last level
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (!(key in current) || typeof current[key] !== 'object' || current[key] === null) {
        current[key] = {}
      }
      current = current[key] as Record<string, unknown>
    }

    // Set final value
    const lastKey = keys[keys.length - 1]
    if (lastKey) {
      current[lastKey] = value
    }
  }

  // Private method: get nested value
  #getNestedValue(obj: unknown, path: string, defaultValue?: unknown): unknown {
    const keys = path.split('.')
    let current = obj

    for (const key of keys) {
      if (current == null || typeof current !== 'object' || !(key in current)) {
        return defaultValue
      }
      current = (current as Record<string, unknown>)[key]
    }

    return current !== undefined ? current : defaultValue
  }
}

// Create singleton instance
const setting = new SettingStore()

// Export instance and types
export { setting }
