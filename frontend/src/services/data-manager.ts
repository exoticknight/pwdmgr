import { decryptData, encryptData } from '@/utils/crypto'
import { getFile } from './file'

export interface DataManager {
  // Load database from file and return parsed data
  loadFromFile: <T>(filePath: string, password: string) => Promise<T>

  // Save structured data to file
  saveToFile: <T>(filePath: string, password: string, data: T) => Promise<void>
}

class DataManagerImpl implements DataManager {
  private file = getFile()

  async loadFromFile<T>(filePath: string, password: string): Promise<T> {
    try {
      // Read encrypted file
      const encryptedData = await this.file.readFile(filePath)

      // Decrypt data
      const jsonData = await decryptData(encryptedData, password)

      // Parse and return structured data
      return JSON.parse(jsonData) as T
    }
    catch (error) {
      console.error('Failed to load from file:', error)
      throw new Error(`Failed to load database from file: ${String(error)}`)
    }
  }

  async saveToFile<T>(filePath: string, password: string, data: T): Promise<void> {
    try {
      // Convert data to JSON string
      const jsonData = JSON.stringify(data)

      // Encrypt data
      const encryptedData = await encryptData(jsonData, password)

      // Save encrypted data to file
      await this.file.saveFile(filePath, encryptedData)
    }
    catch (error) {
      console.error('Failed to save to file:', error)
      throw new Error(`Failed to save database to file: ${String(error)}`)
    }
  }
}

// Singleton instance
let dataManagerInstance: DataManager | null = null

export function getDataManager(): DataManager {
  if (dataManagerInstance == null) {
    dataManagerInstance = new DataManagerImpl()
  }
  return dataManagerInstance
}

export function resetDataManager(): void {
  dataManagerInstance = null
}
