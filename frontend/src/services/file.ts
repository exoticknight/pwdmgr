import type { KeyData } from '@/types/crypto'
import { FILE_FORMAT } from '@/consts/file-format'
import { deserializeKeyData, serializeKeyData } from '@/services/keydata'
import { equals } from '@/utils/uin8array'

const LEGACY_KEY_DATA_SIZE = 184 // 旧版本固定大小
const LEGACY_VERSION = 1

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
   * v1: 2 bytes (uint16 BE) at offset 4-5
   * v2: 1 byte (uint8) at offset 4
   */
  getVersion(content: Uint8Array): number {
    if (content.byteLength < FILE_FORMAT.HEADER_SIZE) {
      return 0
    }

    // 尝试读取1字节 (v2格式)
    const v2Version = content[FILE_FORMAT.VERSION_OFFSET]

    // 如果版本号是0或1，可能是v1格式
    if (v2Version === 0 || v2Version === 1) {
      if (content.byteLength >= 6) {
        const v1Version = readUint16BE(content, FILE_FORMAT.VERSION_OFFSET)
        if (v1Version === 1) {
          return 1 // v1
        }
      }
    }

    return v2Version // v2或更高
  }

  async load(content: Uint8Array): Promise<FileStructure> {
    const isValid = this.validate(content)
    if (!isValid) {
      throw new Error('Invalid file format')
    }

    const version = this.getVersion(content)

    let keyData: KeyData
    let userData: Uint8Array

    if (version === LEGACY_VERSION) {
      // 旧版本格式 (v1)
      keyData = this.#loadLegacyKeyData(content)
      userData = content.slice(FILE_FORMAT.HEADER_SIZE + LEGACY_KEY_DATA_SIZE)
    }
    else if (version === FILE_FORMAT.CURRENT_VERSION) {
      // 新版本格式 (v2) - TLV
      const keyDataLength = readUint16BE(content, FILE_FORMAT.KEY_DATA_LENGTH_OFFSET)
      const keyDataStart = FILE_FORMAT.HEADER_SIZE

      if (content.byteLength < keyDataStart + keyDataLength) {
        throw new Error('Invalid v2 format: keyData length exceeds file size')
      }

      const keyDataBytes = content.slice(keyDataStart, keyDataStart + keyDataLength)
      keyData = deserializeKeyData(keyDataBytes)

      const userDataStart = keyDataStart + keyDataLength
      userData = content.slice(userDataStart)
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
    fileHeader[FILE_FORMAT.KEY_DATA_LENGTH_OFFSET] = (keyDataLength >> 8) & 0xFF // 高字节
    fileHeader[FILE_FORMAT.KEY_DATA_LENGTH_OFFSET + 1] = keyDataLength & 0xFF // 低字节

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

  /**
   * Load KeyData from legacy format (v1)
   */
  #loadLegacyKeyData(content: Uint8Array): KeyData {
    const encryptedContent = content.slice(FILE_FORMAT.HEADER_SIZE)

    if (encryptedContent.byteLength < LEGACY_KEY_DATA_SIZE) {
      throw new Error('Invalid content format: insufficient data')
    }

    // 旧版扁平结构
    const passwordSalt = encryptedContent.slice(0, 32)
    const passwordIv = encryptedContent.slice(32, 44)
    const passwordEncryptedMasterKey = encryptedContent.slice(44, 92)
    const recoverySalt = encryptedContent.slice(92, 124)
    const recoveryIv = encryptedContent.slice(124, 136)
    const recoveryEncryptedMasterKey = encryptedContent.slice(136, 184)

    return {
      password: {
        salt: passwordSalt,
        iv: passwordIv,
        encryptedMasterKey: passwordEncryptedMasterKey,
      },
      recovery: {
        salt: recoverySalt,
        iv: recoveryIv,
        encryptedMasterKey: recoveryEncryptedMasterKey,
      },
    }
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
