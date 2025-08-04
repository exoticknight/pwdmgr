import type { DeepPaths, DeepValue } from '@/types/deep-access'
import type { Setting } from '@/types/setting'
import { DEFAULT_SETTINGS } from '@/consts/setting'

interface SettingState {
  data: Setting
  initialized: boolean
}

class SettingStore {
  #state = $state<SettingState>({
    data: DEFAULT_SETTINGS,
    initialized: false,
  })

  get data(): Setting {
    return this.#state.data
  }

  get initialized(): boolean {
    return this.#state.initialized
  }

  initialize(settings?: Partial<Setting>): void {
    if (settings) {
      this.#state.data = this.#deepMerge($state.snapshot(this.#state.data), settings)
    }
    else {
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
      return this.#getNestedValue(this.#state.data, pathStr, defaultValue)
    }
    else {
      const value = (this.#state.data as unknown as Record<string, unknown>)[pathStr]
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
      this.#setNestedValue(this.#state.data, pathStr, value)
    }
    else {
      (this.#state.data as unknown as Record<string, unknown>)[pathStr] = value
    }
  }

  updateSettings(updates: Partial<Setting>): void {
    if (!this.#state.initialized) {
      throw new Error('Setting store not initialized')
    }

    this.#state.data = this.#deepMerge(this.#state.data, updates)
  }

  reset(): void {
    this.#state.data = DEFAULT_SETTINGS
    this.#state.initialized = false
  }

  export(): Setting {
    if (!this.#state.initialized) {
      throw new Error('Setting store not initialized')
    }

    return $state.snapshot(this.#state.data)
  }

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
          result[key] = this.#deepMerge(targetValue, sourceValue)
        }
        else {
          result[key] = sourceValue
        }
      }
    }

    return result as A & B
  }

  #setNestedValue(obj: unknown, path: string, value: unknown): void {
    const keys = path.split('.')
    let current = obj as Record<string, unknown>

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (!(key in current) || typeof current[key] !== 'object' || current[key] === null) {
        current[key] = {}
      }
      current = current[key] as Record<string, unknown>
    }

    const lastKey = keys[keys.length - 1]
    if (lastKey) {
      current[lastKey] = value
    }
  }

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

const setting = new SettingStore()

export { setting }
