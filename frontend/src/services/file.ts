import type { KeyData } from '@/types/crypto'
import { FILE_FORMAT } from '@/consts/file-format'
import { deserializeKeyData, serializeKeyData } from '@/services/keydata'
import { equals } from '@/utils/uin8array'

export interface FileStructure {
  userData: Uint8Array
  keyData: KeyData
}

export class FileService {
  /**
   * Validate file format
   */
  validate(content: Uint8Array): boolean {
    if (content.byteLength < FILE_FORMAT.HEADER_SIZE) {
      return false
    }

    const magic = content.slice(0, 4)
    if (!equals(magic, FILE_FORMAT.MAGIC_BYTES)) {
      return false
    }

    return true
  }

  /**
   * Get file version from content
   * v2: 1 byte (uint8) at offset 4
   */
  getVersion(content: Uint8Array): number {
    if (content.byteLength < FILE_FORMAT.HEADER_SIZE) {
      return 0
    }

    return content[FILE_FORMAT.VERSION_OFFSET]
  }

  async load(content: Uint8Array): Promise<FileStructure> {
    const isValid = this.validate(content)
    if (!isValid) {
      throw new Error('Invalid file format')
    }

    const version = this.getVersion(content)

    let keyData: KeyData
    let userData: Uint8Array

    if (version === FILE_FORMAT.CURRENT_VERSION) {
      // v2 format - TLV
      const keyDataLength = readUint16BE(content, FILE_FORMAT.KEY_DATA_LENGTH_OFFSET)
      const keyDataStart = FILE_FORMAT.HEADER_SIZE

      if (content.byteLength < keyDataStart + keyDataLength) {
        throw new Error('Invalid v2 format: keyData length exceeds file size')
      }

      const keyDataBytes = content.subarray(keyDataStart, keyDataStart + keyDataLength)
      keyData = deserializeKeyData(keyDataBytes)

      const userDataStart = keyDataStart + keyDataLength
      userData = content.subarray(userDataStart)
    }
    else {
      throw new Error(`Unsupported file version: ${version}`)
    }

    return { keyData, userData }
  }

  async save(structure: FileStructure): Promise<Uint8Array> {
    const { keyData, userData } = structure

    // KeyData (TLV格式)
    const keyDataBytes = serializeKeyData(keyData)
    const keyDataLength = keyDataBytes.byteLength

    // 文件头 (8字节): magic(4) + version(1) + keyDataLength(2) + reserved(1)
    const fileHeader = new Uint8Array(FILE_FORMAT.HEADER_SIZE)
    fileHeader.set(FILE_FORMAT.MAGIC_BYTES, FILE_FORMAT.MAGIC_OFFSET)
    fileHeader[FILE_FORMAT.VERSION_OFFSET] = FILE_FORMAT.CURRENT_VERSION

    const keyDataLengthView = new DataView(fileHeader.buffer, fileHeader.byteOffset + FILE_FORMAT.KEY_DATA_LENGTH_OFFSET, 2)
    keyDataLengthView.setUint16(0, keyDataLength, false) // big-endian

    // 合并所有部分
    const result = new Uint8Array(
      fileHeader.length + keyDataBytes.byteLength + userData.byteLength,
    )

    let offset = 0
    result.set(fileHeader, offset)
    offset += fileHeader.length
    result.set(keyDataBytes, offset)
    offset += keyDataBytes.byteLength
    result.set(userData, offset)

    return result
  }
}

function readUint16BE(data: Uint8Array, offset: number): number {
  const view = new DataView(data.buffer, data.byteOffset + offset, 2)
  return view.getUint16(0, false)
}

let fileServiceInstance: FileService | null = null

export function getFileService(): FileService {
  if (!fileServiceInstance) {
    fileServiceInstance = new FileService()
  }
  return fileServiceInstance
}

export function resetFileService(): void {
  fileServiceInstance = null
}
