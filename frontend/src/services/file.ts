// File operation service - only handles file read/write operations
import { ReadFile, SaveFile } from '../../wailsjs/go/main/App'

export interface FileService {
  // Read file content
  readFile: (filePath: string) => Promise<ArrayBuffer>

  // Save file content
  saveFile: (filePath: string, data: ArrayBuffer) => Promise<void>
}

class WailsFileService implements FileService {
  async readFile(filePath: string): Promise<ArrayBuffer> {
    try {
      const data = await ReadFile(filePath)
      // Convert number[] to ArrayBuffer
      const uint8Array = new Uint8Array(data)
      return uint8Array.buffer
    }
    catch (error: unknown) {
      console.error('Failed to read file:', error)
      throw new Error(`Failed to read file: ${String(error)}`)
    }
  }

  async saveFile(filePath: string, data: ArrayBuffer): Promise<void> {
    try {
      // Convert ArrayBuffer to number[]
      const uint8Array = new Uint8Array(data)
      const dataArray = Array.from(uint8Array)
      await SaveFile(filePath, dataArray)
    }
    catch (error: unknown) {
      console.error('Failed to save file:', error)
      throw new Error(`Failed to save file: ${String(error)}`)
    }
  }
}

// Singleton instance
let fileServiceInstance: FileService | null = null

export function getFileService(): FileService {
  if (!fileServiceInstance) {
    fileServiceInstance = new WailsFileService()
  }
  return fileServiceInstance
}

export function resetFileService(): void {
  fileServiceInstance = null
}
