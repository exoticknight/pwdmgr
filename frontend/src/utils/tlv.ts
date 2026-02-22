/**
 * TLV (Type-Length-Value) serialization module.
 *
 * Format: [type: 1 byte] [length: 2 bytes BE] [value: n bytes]
 *
 * Type IDs:
 * - 0x00: null
 * - 0x01: Object (field count: 2 bytes BE)
 *        Each field: [keyLength: 2 bytes BE] [key: n bytes UTF-8] [value: TLV]
 * - 0x02: Array (element count: 2 bytes BE, each element: TLV)
 * - 0x03: Uint8Array (data length: 2 bytes BE)
 * - 0x04: string (UTF-8 byte length: 2 bytes BE)
 * - 0x05: boolean (0 = false, 1 = true)
 * - 0x06: number
 *        - If length > 0: non-negative integer (length = value)
 *        - If length = 0: IEEE 754 double-precision float (8 bytes)
 *
 * Max length for string, Uint8Array, array elements, and object fields: 65535
 */

const TYPE_NULL = 0x00
const TYPE_OBJECT = 0x01
const TYPE_ARRAY = 0x02
const TYPE_UINT8_ARRAY = 0x03
const TYPE_STRING = 0x04
const TYPE_BOOL = 0x05
const TYPE_NUMBER = 0x06

const MAX_DEPTH = 64 // Maximum nesting depth to prevent stack overflow
const MAX_UINT16 = 65535
const NUMBER_BYTE_LENGTH = 8 // IEEE 754 double-precision

export type SerializableValue
  = | null
    | boolean
    | number
    | string
    | Uint8Array
    | SerializableValue[]
    | { [key: string]: SerializableValue }

/**
 * Serialize a value to Uint8Array (TLV format).
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
    if (length > MAX_UINT16) {
      throw new Error(`String too long: ${length} bytes, max is ${MAX_UINT16}`)
    }

    chunks.push(new Uint8Array([TYPE_STRING]))
    chunks.push(createUint16BE(length))
    chunks.push(data)
  }
  else if (typeof value === 'boolean') {
    chunks.push(new Uint8Array([TYPE_BOOL]))
    chunks.push(createUint16BE(value ? 1 : 0))
  }
  else if (typeof value === 'number') {
    // Optimize: non-negative integers (1-65535) can be stored directly in the length field
    // length > 0 means integer value, length = 0 means IEEE 754 float (8 bytes)
    if (Number.isInteger(value) && value >= 1 && value <= MAX_UINT16) {
      // Integer: store value in length field (3 bytes total)
      chunks.push(new Uint8Array([TYPE_NUMBER]))
      chunks.push(createUint16BE(value))
    }
    else {
      // Float or out-of-range integer: use IEEE 754 double (11 bytes total)
      chunks.push(new Uint8Array([TYPE_NUMBER]))
      chunks.push(createUint16BE(0))
      chunks.push(floatToBytes(value))
    }
  }
  else if (value instanceof Uint8Array) {
    const length = value.byteLength
    if (length > MAX_UINT16) {
      throw new Error(`Uint8Array too long: ${length} bytes, max is ${MAX_UINT16}`)
    }

    chunks.push(new Uint8Array([TYPE_UINT8_ARRAY]))
    chunks.push(createUint16BE(length))
    chunks.push(value)
  }
  else if (Array.isArray(value)) {
    if (value.length > MAX_UINT16) {
      throw new Error(`Array too long: ${value.length} elements, max is ${MAX_UINT16}`)
    }
    const elementChunks: Uint8Array[] = []
    for (const item of value) {
      elementChunks.push(serialize(item))
    }

    chunks.push(new Uint8Array([TYPE_ARRAY]))
    chunks.push(createUint16BE(value.length))
    chunks.push(...elementChunks)
  }
  else if (typeof value === 'object') {
    const keys = Object.keys(value).sort()
    if (keys.length > MAX_UINT16) {
      throw new Error(`Object too large: ${keys.length} fields, max is ${MAX_UINT16}`)
    }
    const fieldChunks: Uint8Array[] = []

    for (const key of keys) {
      const keyData = new TextEncoder().encode(key)
      if (keyData.byteLength > MAX_UINT16) {
        throw new Error(`Object key too long: ${keyData.byteLength} bytes, max is ${MAX_UINT16}`)
      }
      fieldChunks.push(createUint16BE(keyData.byteLength))
      fieldChunks.push(keyData)
      fieldChunks.push(serialize(value[key]))
    }

    chunks.push(new Uint8Array([TYPE_OBJECT]))
    chunks.push(createUint16BE(keys.length))
    chunks.push(...fieldChunks)
  }
  else {
    throw new TypeError(`Unsupported type: ${typeof value}`)
  }

  return concatUint8Arrays(chunks)
}

/**
 * Deserialize a value from Uint8Array (TLV format).
 */
export function deserialize(data: Uint8Array): SerializableValue {
  const { value, consumed } = deserializeRecursive(data, 0, 0)

  // Validate: ensure the entire input buffer was consumed
  if (consumed !== data.byteLength) {
    throw new Error(
      `Input not fully consumed: parsed ${consumed} bytes, total ${data.byteLength} bytes`,
    )
  }

  return value
}

function deserializeRecursive(
  data: Uint8Array,
  offset: number,
  depth: number,
): { value: SerializableValue, consumed: number } {
  if (depth > MAX_DEPTH) {
    throw new Error(`Maximum nesting depth exceeded: ${MAX_DEPTH}`)
  }

  if (offset + 3 > data.byteLength) {
    throw new Error(`Unexpected end of data at offset ${offset}: need 3 bytes, have ${data.byteLength - offset}`)
  }

  const type = data[offset]
  const length = readUint16BE(data, offset + 1)

  switch (type) {
    case TYPE_NULL: {
      return { value: null, consumed: 3 }
    }
    case TYPE_STRING: {
      if (offset + 3 + length > data.byteLength) {
        throw new Error(`Unexpected end of data: type=${type}, length=${length}, offset=${offset}, total=${data.byteLength}`)
      }
      const stringData = data.subarray(offset + 3, offset + 3 + length)
      const value = new TextDecoder().decode(stringData)
      return { value, consumed: 3 + length }
    }
    case TYPE_UINT8_ARRAY: {
      if (offset + 3 + length > data.byteLength) {
        throw new Error(`Unexpected end of data: type=${type}, length=${length}, offset=${offset}, total=${data.byteLength}`)
      }
      const arrayData = data.subarray(offset + 3, offset + 3 + length)
      return { value: arrayData, consumed: 3 + length }
    }
    case TYPE_ARRAY: {
      const elements: SerializableValue[] = []
      let pos = offset + 3

      for (let i = 0; i < length; i++) {
        const { value, consumed } = deserializeRecursive(data, pos, depth + 1)
        elements.push(value)
        pos += consumed
      }

      return { value: elements, consumed: pos - offset }
    }
    case TYPE_OBJECT: {
      const obj: { [key: string]: SerializableValue } = {}
      let pos = offset + 3

      for (let i = 0; i < length; i++) {
        // Check bounds for key length (2 bytes) and key data
        if (pos + 2 > data.byteLength) {
          throw new Error(`Unexpected end of data at offset ${pos}: need 2 bytes for key length`)
        }
        const keyLength = readUint16BE(data, pos)
        if (pos + 2 + keyLength > data.byteLength) {
          throw new Error(`Unexpected end of data: key length=${keyLength}, offset=${pos}, total=${data.byteLength}`)
        }
        const keyData = data.subarray(pos + 2, pos + 2 + keyLength)
        const key = new TextDecoder().decode(keyData)
        pos += 2 + keyLength

        const { value, consumed } = deserializeRecursive(data, pos, depth + 1)
        obj[key] = value
        pos += consumed
      }

      return { value: obj, consumed: pos - offset }
    }
    case TYPE_BOOL: {
      if (offset + 3 > data.byteLength) {
        throw new Error(`Unexpected end of data: type=${type}, offset=${offset}, total=${data.byteLength}`)
      }
      return { value: length !== 0, consumed: 3 }
    }
    case TYPE_NUMBER: {
      // length = 0 indicates float (IEEE 754 double), otherwise length is the integer value
      if (length === 0) {
        // It's a float (8 bytes)
        if (offset + 3 + NUMBER_BYTE_LENGTH > data.byteLength) {
          throw new Error(`Unexpected end of data: type=${type}, offset=${offset}, total=${data.byteLength}`)
        }
        const floatValue = readFloat64BE(data, offset + 3)
        return { value: floatValue, consumed: 3 + NUMBER_BYTE_LENGTH }
      }
      // It's an integer (length is the value)
      return { value: length, consumed: 3 }
    }
    default:
      throw new Error(`Unknown type: ${type}`)
  }
}

function createUint16BE(value: number): Uint8Array {
  const arr = new Uint8Array(2)
  const view = new DataView(arr.buffer)
  view.setUint16(0, value, false)
  return arr
}

function readUint16BE(data: Uint8Array, offset: number): number {
  const view = new DataView(data.buffer, data.byteOffset + offset, 2)
  return view.getUint16(0, false)
}

function floatToBytes(value: number): Uint8Array {
  const arr = new Uint8Array(NUMBER_BYTE_LENGTH)
  const view = new DataView(arr.buffer)
  view.setFloat64(0, value, false) // big-endian
  return arr
}

function readFloat64BE(data: Uint8Array, offset: number): number {
  const view = new DataView(data.buffer, data.byteOffset + offset, NUMBER_BYTE_LENGTH)
  return view.getFloat64(0, false)
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
