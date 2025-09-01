import type { KeyData } from '@/types/crypto'
import { FILE_FORMAT } from '@/consts/file-format'
import { equals } from '@/utils/uin8array'

export interface FileStructure {
  userData: Uint8Array
  keyData: KeyData
}

export class FileService {
  /**
   * Validate file format and extract version information
   * @param content File content as Uint8Array
   * @returns Validation result with version info
   */
  validate(content: Uint8Array): boolean {
    if (content.byteLength < FILE_FORMAT.HEADER_SIZE + FILE_FORMAT.KEY_DATA_SECTION_SIZE) {
      return false
    }

    const magic = content.slice(0, 4)
    if (!equals(magic, FILE_FORMAT.MAGIC_BYTES)) {
      return false
    }

    return true
  }

  async load(content: Uint8Array): Promise<FileStructure> {
    // First validate file format
    const isValid = this.validate(content)
    if (!isValid) {
      throw new Error('Invalid file format')
    }

    const encryptedContent = content.slice(FILE_FORMAT.HEADER_SIZE)

    if (encryptedContent.byteLength < FILE_FORMAT.KEY_DATA_SECTION_SIZE) {
      throw new Error('Invalid content format: insufficient data')
    }

    const keyData = {
      passwordSalt: encryptedContent.slice(0, 32),
      passwordIv: encryptedContent.slice(32, 44),
      passwordEncryptedMasterKey: encryptedContent.slice(44, 92),
      recoverySalt: encryptedContent.slice(92, 124),
      recoveryIv: encryptedContent.slice(124, 136),
      recoveryEncryptedMasterKey: encryptedContent.slice(136, 184),
    }

    const userData = encryptedContent.slice(FILE_FORMAT.KEY_DATA_SECTION_SIZE)

    return { keyData, userData }
  }

  async save(structure: FileStructure): Promise<Uint8Array> {
    const { keyData, userData } = structure

    const fileHeader = this.#createFileHeader()

    const encryptionHeader = new Uint8Array(FILE_FORMAT.KEY_DATA_SECTION_SIZE)

    encryptionHeader.set(keyData.passwordSalt, 0)
    encryptionHeader.set(keyData.passwordIv, 32)
    encryptionHeader.set(keyData.passwordEncryptedMasterKey, 44)
    encryptionHeader.set(keyData.recoverySalt, 92)
    encryptionHeader.set(keyData.recoveryIv, 124)
    encryptionHeader.set(keyData.recoveryEncryptedMasterKey, 136)

    const result = new Uint8Array(
      fileHeader.length + encryptionHeader.length + userData.byteLength,
    )
    result.set(fileHeader, 0)
    result.set(encryptionHeader, fileHeader.length)
    result.set(userData, fileHeader.length + encryptionHeader.length)

    return result
  }

  /**
   * Create file header with magic bytes and version
   * @param version Version number (defaults to current version)
   * @returns 8-byte file header
   */
  #createFileHeader(version: number = FILE_FORMAT.CURRENT_VERSION): Uint8Array {
    const header = new Uint8Array(FILE_FORMAT.HEADER_SIZE)
    const dataView = new DataView(header.buffer)

    header.set(FILE_FORMAT.MAGIC_BYTES, 0)
    dataView.setUint16(4, version, false)
    dataView.setUint16(6, 0, false)

    return header
  }
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
