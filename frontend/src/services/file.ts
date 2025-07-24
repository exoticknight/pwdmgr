// File operations - only handles file read/write operations
import { ReadFile, SaveFile } from '../../wailsjs/go/main/FileService'

export interface File {
  // Read file content
  readFile: (filePath: string) => Promise<ArrayBuffer>

  // Save file content
  saveFile: (filePath: string, data: ArrayBuffer) => Promise<void>
}

class WailsFileImpl implements File {
  async readFile(filePath: string): Promise<ArrayBuffer> {
    try {
      const data = await ReadFile(filePath)

      // Convert number[] to ArrayBuffer properly
      const uint8Array = Uint8Array.from(data)

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
let fileInstance: WailsFileImpl | null = null

export function getFile(): File {
  if (!fileInstance) {
    fileInstance = new WailsFileImpl()
  }
  return fileInstance
}

export function resetFile(): void {
  fileInstance = null
}
