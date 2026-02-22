import typia from 'typia'
import type { KeyData } from '@/types/crypto'
import type { SerializableValue } from '@/utils/tlv'
import { deserialize, serialize } from '@/utils/tlv'

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

  try {
    return typia.assert<KeyData>(obj)
  } catch (e) {
    throw new Error(`Invalid KeyData format after deserialization: ${(e as Error).message}`)
  }
}
