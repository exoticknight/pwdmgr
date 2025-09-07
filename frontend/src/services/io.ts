import { ReadFile, SaveFile } from '../../wailsjs/go/internal/FileService'

export interface IoService {
  readFile: (filePath: string) => Promise<Uint8Array>
  writeFile: (filePath: string, data: Uint8Array) => Promise<void>
  writeTextToFile: (filePath: string, data: string) => Promise<void>
}

class WailsIoImpl implements IoService {
  async readFile(filePath: string): Promise<Uint8Array> {
    try {
      const data = await ReadFile(filePath)
      return Uint8Array.from(data)
    }
    catch (error: unknown) {
      console.error('Failed to read file:', error)
      throw new Error(`Failed to read file: ${String(error)}`)
    }
  }

  async writeFile(filePath: string, data: Uint8Array): Promise<void> {
    try {
      await SaveFile(filePath, Array.from(data))
    }
    catch (error: unknown) {
      console.error('Failed to save file:', error)
      throw new Error(`Failed to save file: ${String(error)}`)
    }
  }

  async writeTextToFile(filePath: string, data: string): Promise<void> {
    try {
      const encoder = new TextEncoder()
      const uint8Data = encoder.encode(data)
      await this.writeFile(filePath, uint8Data)
    }
    catch (error: unknown) {
      console.error('Failed to save text file:', error)
      throw new Error(`Failed to save text file: ${String(error)}`)
    }
  }
}

let ioInstance: WailsIoImpl | null = null

export function getIoService(): IoService {
  if (!ioInstance) {
    ioInstance = new WailsIoImpl()
  }
  return ioInstance
}

export function resetIoService(): void {
  ioInstance = null
}
