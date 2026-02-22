import type { SerializableValue } from '@/utils/tlv'
import { describe, expect, it } from 'vitest'
import { deserialize, serialize } from '@/utils/tlv'

function uint8ArrayToHex(arr: Uint8Array): string {
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join(' ')
}

function arraysEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.byteLength !== b.byteLength)
    return false
  for (let i = 0; i < a.byteLength; i++) {
    if (a[i] !== b[i])
      return false
  }
  return true
}

describe('tLV Serialization', () => {
  describe('null', () => {
    it('should serialize null', () => {
      const result = serialize(null)
      // type(0x00) + length(0x0000)
      expect(uint8ArrayToHex(result)).toBe('00 00 00')
    })

    it('should deserialize null', () => {
      const data = new Uint8Array([0x00, 0x00, 0x00])
      const result = deserialize(data)
      expect(result).toBeNull()
    })

    it('should round-trip null', () => {
      const serialized = serialize(null)
      const deserialized = deserialize(serialized)
      expect(deserialized).toBeNull()
    })
  })

  describe('boolean', () => {
    it('should serialize true', () => {
      const result = serialize(true)
      // type(0x05) + length(0x00) + value(1)
      expect(uint8ArrayToHex(result)).toBe('05 00 01')
    })

    it('should serialize false', () => {
      const result = serialize(false)
      // type(0x05) + length(0x00) + value(0)
      expect(uint8ArrayToHex(result)).toBe('05 00 00')
    })

    it('should deserialize true', () => {
      const data = new Uint8Array([0x05, 0x00, 0x01])
      const result = deserialize(data)
      expect(result).toBe(true)
    })

    it('should deserialize false', () => {
      const data = new Uint8Array([0x05, 0x00, 0x00])
      const result = deserialize(data)
      expect(result).toBe(false)
    })

    it('should round-trip boolean', () => {
      expect(deserialize(serialize(true))).toBe(true)
      expect(deserialize(serialize(false))).toBe(false)
    })
  })

  describe('number', () => {
    it('should serialize zero as float', () => {
      const result = serialize(0)
      // type(0x06) + length(0x0000) + float bytes (8)
      expect(result[0]).toBe(0x06) // TYPE_NUMBER
      expect(result[1]).toBe(0x00) // length high
      expect(result[2]).toBe(0x00) // length = 0 (float marker)
      expect(result.byteLength).toBe(11) // 1 + 2 + 8
    })

    it('should serialize positive integer in length field', () => {
      const result = serialize(42)
      // type(0x06) + length(0x002A) = 3 bytes total
      expect(result[0]).toBe(0x06) // TYPE_NUMBER
      expect(result[1]).toBe(0x00) // length high
      expect(result[2]).toBe(0x2A) // length = 42 (optimized format)
      expect(result.byteLength).toBe(3)
    })

    it('should serialize max uint16 in length field', () => {
      const result = serialize(65535)
      // type(0x06) + length(0xFFFF) = 3 bytes total
      expect(result[0]).toBe(0x06) // TYPE_NUMBER
      expect(result[1]).toBe(0xFF) // length high
      expect(result[2]).toBe(0xFF) // length low = 65535 (optimized format)
      expect(result.byteLength).toBe(3)
    })

    it('should deserialize number', () => {
      // Use serialize to generate valid data, then deserialize
      const data = serialize(42)
      const result = deserialize(data)
      expect(result).toBeCloseTo(42, 10)
    })

    it('should round-trip number', () => {
      const testCases = [0, 1, 42, 100, 65535, -1, 3.14, 65536]
      for (const testCase of testCases) {
        const serialized = serialize(testCase)
        const deserialized = deserialize(serialized)
        if (typeof testCase === 'number' && !Number.isInteger(testCase)) {
          expect(deserialized).toBeCloseTo(testCase, 10)
        }
        else {
          expect(deserialized).toBe(testCase)
        }
      }
    })
  })

  describe('string', () => {
    it('should serialize empty string', () => {
      const result = serialize('')
      // type(0x04) + length(0x0000) + (no data)
      expect(uint8ArrayToHex(result)).toBe('04 00 00')
    })

    it('should serialize string', () => {
      const result = serialize('hello')
      // type(0x04) + length(0x0005) + 'hello'
      const expected = new Uint8Array([0x04, 0x00, 0x05, 0x68, 0x65, 0x6C, 0x6C, 0x6F])
      expect(arraysEqual(result, expected)).toBe(true)
    })

    it('should serialize unicode string', () => {
      const result = serialize('你好')
      // type(0x04) + length(0x0006) + UTF-8 '你好' (3 bytes each)
      expect(result[1]).toBe(0x00) // high byte of length
      expect(result[2]).toBe(0x06) // low byte of length (6 bytes)
    })

    it('should deserialize string', () => {
      const data = new Uint8Array([0x04, 0x00, 0x05, 0x68, 0x65, 0x6C, 0x6C, 0x6F])
      const result = deserialize(data)
      expect(result).toBe('hello')
    })

    it('should round-trip string', () => {
      const testCases = ['', 'hello', '你好', 'Hello World!', '特殊字符!@#$%']
      for (const testCase of testCases) {
        const serialized = serialize(testCase)
        const deserialized = deserialize(serialized)
        expect(deserialized).toBe(testCase)
      }
    })
  })

  describe('uint8Array', () => {
    it('should serialize empty Uint8Array', () => {
      const result = serialize(new Uint8Array(0))
      // type(0x03) + length(0x0000)
      expect(uint8ArrayToHex(result)).toBe('03 00 00')
    })

    it('should serialize Uint8Array', () => {
      const arr = new Uint8Array([0x01, 0x02, 0x03, 0xFF])
      const result = serialize(arr)
      // type(0x03) + length(0x0004) + data
      expect(result[0]).toBe(0x03)
      expect(result[1]).toBe(0x00)
      expect(result[2]).toBe(0x04)
      expect(result[3]).toBe(0x01)
      expect(result[4]).toBe(0x02)
      expect(result[5]).toBe(0x03)
      expect(result[6]).toBe(0xFF)
    })

    it('should deserialize Uint8Array', () => {
      const data = new Uint8Array([0x03, 0x00, 0x04, 0x01, 0x02, 0x03, 0xFF])
      const result = deserialize(data)
      expect(result).toBeInstanceOf(Uint8Array)
      expect(Array.from(result as Uint8Array)).toEqual([0x01, 0x02, 0x03, 0xFF])
    })

    it('should round-trip Uint8Array', () => {
      const testCases = [
        new Uint8Array(0),
        new Uint8Array([0x00]),
        new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05]),
        new Uint8Array(255).fill(0xFF),
      ]
      for (const testCase of testCases) {
        const serialized = serialize(testCase)
        const deserialized = deserialize(serialized)
        expect(deserialized).toBeInstanceOf(Uint8Array)
        expect(arraysEqual(deserialized as Uint8Array, testCase)).toBe(true)
      }
    })
  })

  describe('array', () => {
    it('should serialize empty array', () => {
      const result = serialize([])
      // type(0x02) + length(0x0000) = 3 bytes
      expect(uint8ArrayToHex(result)).toBe('02 00 00')
    })

    it('should serialize array with primitives', () => {
      const result = serialize(['a', 'b'])
      // type(0x02) + count(2) + 'a' TLV + 'b' TLV
      expect(result[0]).toBe(0x02) // type
      expect(result[1]).toBe(0x00) // length high
      expect(result[2]).toBe(0x02) // length low (2 elements)
    })

    it('should deserialize array', () => {
      const data = new Uint8Array([
        0x02,
        0x00,
        0x02, // type=array, count=2
        0x04,
        0x00,
        0x01,
        0x61, // 'a'
        0x04,
        0x00,
        0x01,
        0x62, // 'b'
      ])
      const result = deserialize(data)
      expect(result).toEqual(['a', 'b'])
    })

    it('should round-trip array', () => {
      const validCases = [
        [],
        [null],
        ['a', 'b', 'c'],
        [new Uint8Array([0x01, 0x02]), new Uint8Array([0x03, 0x04])],
        [['a', 'b'], ['c', 'd']],
      ]
      for (const testCase of validCases) {
        const serialized = serialize(testCase)
        const deserialized = deserialize(serialized)
        expect(deserialized).toEqual(testCase)
      }
    })
  })

  describe('object', () => {
    it('should serialize empty object', () => {
      const result = serialize({})
      // type(0x01) + count(0x0000) = 3 bytes
      expect(uint8ArrayToHex(result)).toBe('01 00 00')
    })

    it('should serialize object with fields', () => {
      const result = serialize({ foo: 'bar' })
      // type(0x01) + count(1) + key('foo') + value('bar')
      expect(result[0]).toBe(0x01) // type
      expect(result[1]).toBe(0x00) // field count high
      expect(result[2]).toBe(0x01) // field count low (1 field)
    })

    it('should deserialize object', () => {
      const data = new Uint8Array([
        0x01,
        0x00,
        0x01, // type=object, 1 field
        0x00,
        0x03,
        0x66,
        0x6F,
        0x6F, // key 'foo' (3 bytes)
        0x04,
        0x00,
        0x03,
        0x62,
        0x61,
        0x72, // value 'bar' (3 bytes)
      ])
      const result = deserialize(data)
      expect(result).toEqual({ foo: 'bar' })
    })

    it('should round-trip object', () => {
      const validCases: SerializableValue[] = [
        {},
        { foo: 'bar' },
        { nested: { inner: 'value' } },
        { array: ['x', 'y'], string: 'hello' },
        { data: new Uint8Array([0x01, 0x02, 0x03]) },
      ]
      for (const testCase of validCases) {
        const serialized = serialize(testCase)
        const deserialized = deserialize(serialized)
        expect(deserialized).toEqual(testCase)
      }
    })
  })

  describe('nested structures (KeyData simulation)', () => {
    it('should serialize nested KeyData-like structure', () => {
      const keyData = {
        password: {
          salt: new Uint8Array(32).fill(0).map((_, i) => i),
          iv: new Uint8Array([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B]),
          encryptedMasterKey: new Uint8Array(48).fill(0xFF),
        },
        recovery: {
          salt: new Uint8Array(32).fill(0x00),
          iv: new Uint8Array(12).fill(0x00),
          encryptedMasterKey: new Uint8Array(48).fill(0x00),
        },
      }

      const serialized = serialize(keyData)

      // Should not be empty
      expect(serialized.byteLength).toBeGreaterThan(0)

      // Should be able to deserialize
      const deserialized = deserialize(serialized) as Record<string, Record<string, SerializableValue>>

      // Check structure
      expect(deserialized.password).toBeDefined()
      expect(deserialized.recovery).toBeDefined()

      // Check password fields
      const password = deserialized.password
      expect(password.salt).toBeInstanceOf(Uint8Array)
      expect(password.iv).toBeInstanceOf(Uint8Array)
      expect(password.encryptedMasterKey).toBeInstanceOf(Uint8Array)

      // Check sizes
      const salt = password.salt as Uint8Array
      const iv = password.iv as Uint8Array
      const encrypted = password.encryptedMasterKey as Uint8Array
      expect(salt.byteLength).toBe(32)
      expect(iv.byteLength).toBe(12)
      expect(encrypted.byteLength).toBe(48)

      // Check values
      for (let i = 0; i < 32; i++) {
        expect(salt[i]).toBe(i)
      }
      for (let i = 0; i < 12; i++) {
        expect(iv[i]).toBe(i)
      }
      for (let i = 0; i < 48; i++) {
        expect(encrypted[i]).toBe(0xFF)
      }
    })

    it('should handle recovery disabled (all zeros)', () => {
      const keyData = {
        password: {
          salt: new Uint8Array(32).fill(0xAA),
          iv: new Uint8Array(12).fill(0xBB),
          encryptedMasterKey: new Uint8Array(48).fill(0xCC),
        },
        recovery: {
          salt: new Uint8Array(32).fill(0x00),
          iv: new Uint8Array(12).fill(0x00),
          encryptedMasterKey: new Uint8Array(48).fill(0x00),
        },
      }

      const serialized = serialize(keyData)
      const deserialized = deserialize(serialized) as Record<string, Record<string, SerializableValue>>

      const recovery = deserialized.recovery
      const encryptedRecovery = recovery.encryptedMasterKey as Uint8Array

      // All zeros should be preserved
      expect(Array.from(encryptedRecovery).every(b => b === 0)).toBe(true)
    })
  })

  describe('error handling', () => {
    it('should throw on undefined', () => {
      expect(() => serialize(undefined as unknown as SerializableValue)).toThrow('Cannot serialize undefined')
    })

    it('should throw on string exceeding max length', () => {
      const longString = 'a'.repeat(65536)
      expect(() => serialize(longString)).toThrow('String too long')
    })

    it('should throw on Uint8Array exceeding max length', () => {
      const longArray = new Uint8Array(65536)
      expect(() => serialize(longArray)).toThrow('Uint8Array too long')
    })

    it('should throw on array exceeding max length', () => {
      const longArray: SerializableValue[] = Array.from({ length: 65536 }, () => 'a')
      expect(() => serialize(longArray)).toThrow('Array too long')
    })

    it('should throw on object exceeding max fields', () => {
      const largeObj: Record<string, string> = {}
      for (let i = 0; i < 65536; i++) {
        largeObj[`key${i}`] = 'value'
      }
      expect(() => serialize(largeObj)).toThrow('Object too large')
    })

    it('should throw on object key exceeding max length', () => {
      const longKey = 'a'.repeat(65536)
      expect(() => serialize({ [longKey]: 'value' })).toThrow('Object key too long')
    })

    it('should throw on truncated data', () => {
      const data = new Uint8Array([0x04, 0x00, 0x10]) // string with length 16 but no data
      expect(() => deserialize(data)).toThrow('Unexpected end of data')
    })

    it('should throw on unknown type byte', () => {
      const data = new Uint8Array([0xFF, 0x00, 0x00]) // unknown type
      expect(() => deserialize(data)).toThrow('Unknown type')
    })

    it('should throw on empty data', () => {
      expect(() => deserialize(new Uint8Array(0))).toThrow()
    })

    it('should throw on partial header', () => {
      expect(() => deserialize(new Uint8Array([0x04]))).toThrow()
      expect(() => deserialize(new Uint8Array([0x04, 0x00]))).toThrow()
    })
  })

  describe('boundary conditions', () => {
    it('should handle maximum length values', () => {
      // Test with data near Uint16 max
      const largeArray = new Uint8Array(65535).fill(0xAB)
      const serialized = serialize(largeArray)

      // Should serialize correctly
      expect(serialized[0]).toBe(0x03) // type Uint8Array
      expect(serialized[1]).toBe(0xFF) // length high
      expect(serialized[2]).toBe(0xFF) // length low

      // Should deserialize correctly
      const deserialized = deserialize(serialized) as Uint8Array
      expect(deserialized.byteLength).toBe(65535)
      expect(deserialized[0]).toBe(0xAB)
      expect(deserialized[65534]).toBe(0xAB)
    })

    it('should handle many object fields', () => {
      const obj: Record<string, string> = {}
      for (let i = 0; i < 100; i++) {
        obj[`key${i}`] = `value${i}`
      }

      const serialized = serialize(obj)
      const deserialized = deserialize(serialized) as Record<string, string>

      expect(Object.keys(deserialized).length).toBe(100)
      expect(deserialized.key0).toBe('value0')
      expect(deserialized.key99).toBe('value99')
    })

    it('should handle deeply nested arrays', () => {
      const stringNested = [[['a', 'b'], ['c', 'd']], [['e', 'f'], ['g', 'h']]]

      const serialized = serialize(stringNested)
      const deserialized = deserialize(serialized)

      expect(deserialized).toEqual(stringNested)
    })
  })
})
