import type { KeyData } from '@/types/crypto'
import type { SerializableValue } from '@/utils/tlv'
import typia from 'typia'
import { deserialize, serialize } from '@/utils/tlv'

/**
 * 序列化KeyData为Uint8Array
 */
export function serializeKeyData(keyData: KeyData): Uint8Array {
  return serialize(keyData as unknown as SerializableValue)
}

/**
 * 从Uint8Array反序列化KeyData
 */
export function deserializeKeyData(data: Uint8Array): KeyData {
  const obj = deserialize(data)

  try {
    return typia.assert<KeyData>(obj)
  }
  catch (e) {
    throw new Error(`Invalid KeyData format after deserialization: ${(e as Error).message}`)
  }
}
