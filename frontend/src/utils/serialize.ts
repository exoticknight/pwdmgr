/**
 * TLV (Type-Length-Value) 序列化模块
 *
 * 格式: [type: 1 byte] [length: 2 bytes BE] [value: n bytes]
 *
 * Type ID 定义:
 * - 0x00: null
 * - 0x01: Object (字段数: 2 bytes BE, 每个字段: key(string) + value(TLV))
 * - 0x02: Array (元素数: 2 bytes BE, 每个元素: TLV)
 * - 0x03: Uint8Array (数据长度: 2 bytes BE)
 * - 0x04: string (UTF-8字节长度: 2 bytes BE)
 *
 * 后续可扩展: bool (0x05), int (0x06) 等
 */

const TYPE_NULL = 0x00
const TYPE_OBJECT = 0x01
const TYPE_ARRAY = 0x02
const TYPE_UINT8_ARRAY = 0x03
const TYPE_STRING = 0x04

export type SerializableValue
  = | null
    | boolean
    | number
    | string
    | Uint8Array
    | SerializableValue[]
    | { [key: string]: SerializableValue }

/**
 * 序列化一个值到Uint8Array
 */
export function serialize(value: SerializableValue): Uint8Array {
  if (value === undefined) {
    throw new Error('Cannot serialize undefined')
  }

  const chunks: Uint8Array[] = []

  if (value === null) {
    chunks.push(new Uint8Array([TYPE_NULL, 0x00, 0x00]))
  }
  else if (typeof value === 'string') {
    const data = new TextEncoder().encode(value)
    const length = data.byteLength

    chunks.push(new Uint8Array([TYPE_STRING]))
    chunks.push(createUint16BE(length))
    chunks.push(data)
  }
  else if (value instanceof Uint8Array) {
    const length = value.byteLength

    chunks.push(new Uint8Array([TYPE_UINT8_ARRAY]))
    chunks.push(createUint16BE(length))
    chunks.push(value)
  }
  else if (Array.isArray(value)) {
    const elementChunks: Uint8Array[] = []
    for (const item of value) {
      elementChunks.push(serialize(item))
    }

    chunks.push(new Uint8Array([TYPE_ARRAY]))
    chunks.push(createUint16BE(value.length)) // 元素个数
    chunks.push(...elementChunks)
  }
  else if (typeof value === 'object') {
    const keys = Object.keys(value)
    const fieldChunks: Uint8Array[] = []

    for (const key of keys) {
      const keyData = new TextEncoder().encode(key)
      fieldChunks.push(createUint16BE(keyData.byteLength))
      fieldChunks.push(keyData)
      fieldChunks.push(serialize(value[key]))
    }

    chunks.push(new Uint8Array([TYPE_OBJECT]))
    chunks.push(createUint16BE(keys.length)) // 字段个数
    chunks.push(...fieldChunks)
  }
  else {
    throw new TypeError(`Unsupported type: ${typeof value}`)
  }

  return concatUint8Arrays(chunks)
}

/**
 * 从Uint8Array反序列化一个值
 */
export function deserialize(data: Uint8Array): SerializableValue {
  const { value } = deserializeRecursive(data, 0)
  return value
}

function deserializeRecursive(
  data: Uint8Array,
  offset: number,
): { value: SerializableValue, consumed: number } {
  // 检查是否有足够的空间读取type(1) + length(2)
  if (offset + 3 > data.byteLength) {
    throw new Error(`Unexpected end of data at offset ${offset}: need 3 bytes, have ${data.byteLength - offset}`)
  }

  const type = data[offset]
  const length = readUint16BE(data, offset + 1)

  // 检查是否有足够的数据
  if (offset + 3 + length > data.byteLength) {
    throw new Error(`Unexpected end of data: type=${type}, length=${length}, offset=${offset}, total=${data.byteLength}`)
  }

  switch (type) {
    case TYPE_NULL: {
      return { value: null, consumed: 3 }
    }
    case TYPE_STRING: {
      const stringData = data.slice(offset + 3, offset + 3 + length)
      const value = new TextDecoder().decode(stringData)
      return { value, consumed: 3 + length }
    }
    case TYPE_UINT8_ARRAY: {
      const arrayData = data.slice(offset + 3, offset + 3 + length)
      return { value: arrayData, consumed: 3 + length }
    }
    case TYPE_ARRAY: {
      const elements: SerializableValue[] = []
      let pos = offset + 3

      for (let i = 0; i < length; i++) {
        const { value, consumed } = deserializeRecursive(data, pos)
        elements.push(value)
        pos += consumed
      }

      return { value: elements, consumed: pos - offset }
    }
    case TYPE_OBJECT: {
      const obj: { [key: string]: SerializableValue } = {}
      let pos = offset + 3

      for (let i = 0; i < length; i++) {
        const keyLength = readUint16BE(data, pos)
        const keyData = data.slice(pos + 2, pos + 2 + keyLength)
        const key = new TextDecoder().decode(keyData)
        pos += 2 + keyLength

        const { value, consumed } = deserializeRecursive(data, pos)
        obj[key] = value
        pos += consumed
      }

      return { value: obj, consumed: pos - offset }
    }
    default:
      throw new Error(`Unknown type: ${type}`)
  }
}

function createUint16BE(value: number): Uint8Array {
  const arr = new Uint8Array(2)
  const view = new DataView(arr.buffer)
  view.setUint16(0, value, false) // big-endian
  return arr
}

function readUint16BE(data: Uint8Array, offset: number): number {
  const view = new DataView(data.buffer, data.byteOffset + offset, 2)
  return view.getUint16(0, false) // big-endian
}

function concatUint8Arrays(arrays: Uint8Array[]): Uint8Array {
  const totalLength = arrays.reduce((sum, arr) => sum + arr.byteLength, 0)
  const result = new Uint8Array(totalLength)
  let pos = 0

  for (const arr of arrays) {
    result.set(arr, pos)
    pos += arr.byteLength
  }

  return result
}
