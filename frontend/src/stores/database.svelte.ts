import type { PartialDeep } from 'type-fest'
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
  #exportedData: Datum[] | null = null
  #exportedSetting: Setting | null = null

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
        const rawData = typia.assert<Datum[]>(dataFile.data)
        const settings = typia.assert<PartialDeep<Setting>>(dataFile.setting ?? {})

        data.initialize(rawData)
        setting.initialize(settings)

        // !!!for DEBUG
        // data.initialize(dataFile.data)
        // setting.initialize(dataFile.setting ?? {})

        i18n.changeLanguage(setting.getSetting('language.code'))

        this.#exportedData = data.export()
        this.#exportedSetting = setting.export()
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

    return this
  }

  commitSetting() {
    if (!this.initialized) {
      throw new Error('Database not initialized')
    }

    this.#exportedSetting = setting.export()

    return this
  }

  commitData() {
    if (!this.initialized) {
      throw new Error('Database not initialized')
    }

    this.#exportedData = data.export()

    return this
  }

  export(): DataFile {
    if (!this.initialized) {
      throw new Error('Database not initialized')
    }

    return {
      version: VERSION,
      setting: this.#exportedSetting ?? setting.export(),
      data: this.#exportedData ?? data.export(),
    }
  }

  close() {
    data.reset()
    setting.reset()
    this.#state.initialized = false
    this.#state.error = null

    return this
  }

  clearError() {
    this.#state.error = null

    return this
  }
}

const database = new DatabaseStore()

export { database }
