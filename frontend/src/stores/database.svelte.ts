import type { Datum } from '@/types/data'
import type { DataFile } from '@/types/datafile'
import type { Setting } from '@/types/setting'

import typia from 'typia'

import { DEFAULT_SETTINGS } from '@/consts/setting'
import { VERSION } from '@/consts/version'

import { i18n } from '@/stores/i18n.svelte'
import { data } from './data.svelte'
import { setting } from './setting.svelte'

// Database state interface
interface DatabaseState {
  initialized: boolean
  error: string | null
}

// Database store implementation using Svelte 5 state
class DatabaseStore {
  #rawDataFile: DataFile | null = null
  #rawData: Datum[] | null = null
  #rawSettings: Partial<Setting> | null = null

  #state = $state<DatabaseState>({
    initialized: false,
    error: null,
  })

  get initialized() {
    return this.#state.initialized
  }

  initialize(dataFile?: DataFile) {
    if (this.#state.initialized) {
      this.close()
      this.#state.initialized = false
    }

    this.#state.error = null

    try {
      if (dataFile != null) {
        this.#rawDataFile = dataFile

        const rawData = typia.assert<Datum[]>(dataFile.data)
        const settings = typia.assert<Partial<Setting>>(dataFile.setting ?? {})

        this.#rawData = rawData
        this.#rawSettings = settings

        data.initialize(rawData)
        setting.initialize(settings)

        i18n.changeLanguage(setting.getSetting('language.code'))
      }
      else {
        // Create new empty database
        data.initialize([])
        setting.initialize(DEFAULT_SETTINGS)
      }

      this.#state.initialized = true
    }
    catch (error) {
      this.#state.initialized = false
      this.#state.error = 'Failed to parse database. Data format is invalid.'

      console.error('Failed to parse database:', error)
      throw new Error('Failed to parse database. Data format is invalid.')
    }
  }

  export(): DataFile {
    if (!this.initialized) {
      throw new Error('Database not initialized')
    }

    return this.#rawDataFile = {
      version: VERSION,
      setting: setting.export(),
      data: data.export(),
    }
  }

  close(): void {
    data.reset()
    setting.reset()
    this.#state.initialized = false
    this.#state.error = null
  }

  clearError(): void {
    this.#state.error = null
  }
}

const database = new DatabaseStore()

export { database }
