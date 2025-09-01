import type { PartialDeep } from 'type-fest'

import type { FileStructure } from '@/services/file'
import type { Datum } from '@/types/data'
import type { DataFile } from '@/types/datafile'

import type { Setting } from '@/types/setting'

import typia from 'typia'

import { DEFAULT_SETTINGS } from '@/consts/setting'
import { VERSION } from '@/consts/version'
import { getFileService } from '@/services/file'
import { getIoService } from '@/services/io'

import { auth } from './auth.svelte'
import { data } from './data.svelte'
import { i18n } from './i18n.svelte'
import { setting } from './setting.svelte'

interface DatabaseState {
  initialized: boolean
  error: string | null
}

class DatabaseStore {
  #ioService = getIoService()
  #fileService = getFileService()

  #exportedData: Datum[] | null = null
  #exportedSetting: Setting | null = null

  #state = $state<DatabaseState>({
    initialized: false,
    error: null,
  })

  get initialized() {
    return this.#state.initialized
  }

  get error() {
    return this.#state.error
  }

  #initialize(dataFile?: DataFile) {
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

  async loadFromFile(file: FileStructure, password: string) {
    try {
      await auth.auth(password, file.keyData)
    }
    catch (error) {
      console.error('Authentication error:', error)
      throw error
    }

    const decryptedData = await auth.decryptData(file.userData)
    const dataFile = JSON.parse(decryptedData) as DataFile

    this.#initialize(dataFile)
  }

  async loadFromRecovery(filePath: string, recoveryCode: string) {
    const content = await this.#ioService.readFile(filePath)
    const file = await this.#fileService.load(content)

    try {
      await auth.recover(recoveryCode, file.keyData)
    }
    catch (error) {
      console.error('Authentication error:', error)
      throw error
    }

    const decryptedData = await auth.decryptData(file.userData)
    const dataFile = JSON.parse(decryptedData) as DataFile

    this.#initialize(dataFile)
  }

  async saveToFile(filePath: string) {
    if (!this.initialized) {
      throw new Error('Database not initialized')
    }

    const dataFile = this.export()
    const encryptedData = await auth.encryptData(JSON.stringify(dataFile))

    const content = await this.#fileService.save({
      userData: encryptedData,
      keyData: auth.keyData,
    })

    await this.#ioService.writeFile(filePath, content)
  }

  async loadFromScratch(password: string) {
    await auth.changeMasterKey(password)
    this.#initialize()
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
    auth.unauth()
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
