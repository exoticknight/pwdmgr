# File Binary Layout

This document describes the on-disk binary layout and in-code data structures for the application's encrypted file format.

## Overview

Files use a small file header followed by a variable-length key-data section (using TLV format) and then the variable-length user data encrypted with the master key.

- File header size: 8 bytes
- Key data section: Variable length (TLV format)
- Version: 2 (current)

## Binary Layout

```text
Offset   Size  Content
0-3      4     Magic Bytes ("B3M6")
4        1     Version (uint8, value: 2)
5-6      2     Key Data Length (big-endian uint16)
7        1     Reserved

// Key Data Section (TLV format, starts at offset 8)
8+       Var   TLV-encoded KeyData (nested Object)

// User Data Section
8+Len    Var   User Data (encrypted with the master key)
```

## KeyData Structure

KeyData is serialized as a nested Object using the TLV format:

```typescript
interface KeyData {
  password: {
    salt: Uint8Array        // 32 bytes
    iv: Uint8Array          // 12 bytes
    encryptedMasterKey: Uint8Array  // 48 bytes
  }
  recovery: {
    salt: Uint8Array        // 32 bytes
    iv: Uint8Array          // 12 bytes
    encryptedMasterKey: Uint8Array  // 48 bytes
  }
}
```

## TLV Format

See [TLV_Format.md](TLV_Format.md) for detailed TLV format specification.

## Field Descriptions

- Magic Bytes: 4-byte signature to identify the file type. Value: `0x42, 0x33, 0x4D, 0x36` ("B3M6")
- Version: File format version (2 = current TLV format)
- Key Data Length: Length of the TLV-encoded KeyData section in bytes
- Reserved: 1 byte reserved for future use
- User Data: The remainder of the file; encrypted using the unlocked master key
