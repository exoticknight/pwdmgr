import type { DatabaseService } from './database'
import { decryptData, encryptData } from '../utils/crypto'
import { getDatabaseService, resetDatabaseService } from './database'
import { getFileService } from './file'

export interface DataManagerService {
  // Load database from file
  loadFromFile: (filePath: string, password: string) => Promise<DatabaseService>

  // Load database from encrypted data
  loadFromEncryptedData: (encryptedData: ArrayBuffer, password: string) => Promise<DatabaseService>

  // Save database to file
  saveToFile: (database: DatabaseService, filePath: string, password: string) => Promise<void>

  // Get encrypted data
  getEncryptedData: (database: DatabaseService, password: string) => Promise<ArrayBuffer>
}

class DataManager implements DataManagerService {
  private fileService = getFileService()

  async loadFromFile(filePath: string, password: string): Promise<DatabaseService> {
    try {
      // Reset any existing database instance first
      resetDatabaseService()

      // Read encrypted file
      const encryptedData = await this.fileService.readFile(filePath)

      // Decrypt data
      const jsonData = await decryptData(encryptedData, password)

      // Initialize database
      const database = getDatabaseService()
      database.initialize(jsonData)

      return database
    }
    catch (error) {
      console.error('Failed to load from file:', error)
      throw new Error(`Failed to load database from file: ${String(error)}`)
    }
  }

  async loadFromEncryptedData(encryptedData: ArrayBuffer, password: string): Promise<DatabaseService> {
    try {
      // Reset any existing database instance first
      resetDatabaseService()

      // Decrypt data
      const jsonData = await decryptData(encryptedData, password)

      // Initialize database
      const database = getDatabaseService()
      database.initialize(jsonData)

      return database
    }
    catch (error) {
      console.error('Failed to load from encrypted data:', error)
      throw new Error(`Failed to load database from encrypted data: ${String(error)}`)
    }
  }

  async saveToFile(database: DatabaseService, filePath: string, password: string): Promise<void> {
    try {
      // Export JSON data
      const jsonData = database.exportJSON()

      // Encrypt data
      const encryptedData = await encryptData(jsonData, password)

      // Write to file
      await this.fileService.saveFile(filePath, encryptedData)
    }
    catch (error) {
      console.error('Failed to save to file:', error)
      throw new Error(`Failed to save database to file: ${String(error)}`)
    }
  }

  async getEncryptedData(database: DatabaseService, password: string): Promise<ArrayBuffer> {
    try {
      // Export JSON data
      const jsonData = database.exportJSON()

      // Encrypt data
      const encryptedData = await encryptData(jsonData, password)

      return encryptedData
    }
    catch (error) {
      console.error('Failed to get encrypted data:', error)
      throw new Error(`Failed to get encrypted data: ${String(error)}`)
    }
  }
}

// Singleton instance
let dataManagerInstance: DataManager | null = null

export function getDataManagerService(): DataManagerService {
  if (!dataManagerInstance) {
    dataManagerInstance = new DataManager()
  }
  return dataManagerInstance
}
