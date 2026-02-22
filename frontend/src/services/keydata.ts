import type { SerializableValue } from '@/utils/tlv'
import { deserialize, serialize } from '@/utils/tlv'

/**
 * KeyData结构 (使用Object自描述的嵌套格式)
 */
export interface KeyData {
  password: {
    salt: Uint8Array
    iv: Uint8Array
    encryptedMasterKey: Uint8Array
  }
  recovery: {
    salt: Uint8Array
    iv: Uint8Array
    encryptedMasterKey: Uint8Array
  }
}

/**
 * 序列化KeyData为Uint8Array
 */
export function serializeKeyData(keyData: KeyData): Uint8Array {
  const obj: SerializableValue = {
    password: {
      salt: keyData.password.salt,
      iv: keyData.password.iv,
      encryptedMasterKey: keyData.password.encryptedMasterKey,
    },
    recovery: {
      salt: keyData.recovery.salt,
      iv: keyData.recovery.iv,
      encryptedMasterKey: keyData.recovery.encryptedMasterKey,
    },
  }

  return serialize(obj)
}

/**
 * 从Uint8Array反序列化KeyData
 */
export function deserializeKeyData(data: Uint8Array): KeyData {
  const obj = deserialize(data)

  if (typeof obj !== 'object' || obj === null) {
    throw new Error('Invalid KeyData: expected object')
  }

  const objRecord = obj as Record<string, SerializableValue>

  if (
    !objRecord.password
    || typeof objRecord.password !== 'object'
    || objRecord.password === null
  ) {
    throw new Error('Invalid KeyData: missing password object')
  }

  if (
    !objRecord.recovery
    || typeof objRecord.recovery !== 'object'
    || objRecord.recovery === null
  ) {
    throw new Error('Invalid KeyData: missing recovery object')
  }

  const password = objRecord.password as Record<string, SerializableValue>
  const recovery = objRecord.recovery as Record<string, SerializableValue>

  const extractUint8Array = (
    obj: Record<string, SerializableValue>,
    field: string,
  ): Uint8Array => {
    const value = obj[field]
    if (!(value instanceof Uint8Array)) {
      throw new TypeError(`Invalid KeyData: password.${field} is not Uint8Array`)
    }
    return value
  }

  return {
    password: {
      salt: extractUint8Array(password, 'salt'),
      iv: extractUint8Array(password, 'iv'),
      encryptedMasterKey: extractUint8Array(password, 'encryptedMasterKey'),
    },
    recovery: {
      salt: extractUint8Array(recovery, 'salt'),
      iv: extractUint8Array(recovery, 'iv'),
      encryptedMasterKey: extractUint8Array(recovery, 'encryptedMasterKey'),
    },
  }
}
