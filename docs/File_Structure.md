# File Binary Layout

This document describes the on-disk binary layout and in-code data structures for the application's encrypted file format.

## Overview

Files use a small file header followed by a fixed-size key-data section and then the variable-length user data encrypted with the master key.

- File header size: 8 bytes (defined in code as `FILE_FORMAT.HEADER_SIZE = 8`)
- Key data section size: 184 bytes (defined in code as `FILE_FORMAT.KEY_DATA_SECTION_SIZE = 184`)
- Total fixed prefix before user data: 192 bytes (8 + 184)

## Binary Layout (offsets are absolute file offsets)

```text
Offset   Size  Content
0-3      4     Magic Bytes (e.g. "M6A5")
4-5      2     Version (big-endian uint16)
6-7      2     Reserved (currently zero)

// Key data section (starts at offset 8, length 184 bytes)
8-39     32    Password Salt
40-51    12    Password IV
52-99    48    Password Encrypted Master Key (32 bytes key + 16 bytes auth tag)
100-131  32    Recovery Salt (zero-filled if recovery disabled)
132-143  12    Recovery IV (zero-filled if recovery disabled)
144-191  48    Recovery Encrypted Master Key (zero-filled if recovery disabled)

192+     Var   User Data (encrypted with the master key)
```

Notes:
- The file header (first 8 bytes) is used for quick validation: the implementation checks the magic bytes and then reads the version.
- The key data section is a raw binary region (not Base64) and is handled as `Uint8Array` in the frontend code.
- When the recovery path is not used, the recovery salt/IV/encrypted fields are zero-filled.

## Field Descriptions

- Magic Bytes: 4-byte signature to identify the file type. Current value in code: `new Uint8Array([0x4D, 0x36, 0x41, 0x35])` ("M6A5").
- Version: 16-bit unsigned integer (big-endian) indicating the file format version.
- Reserved: 2 bytes reserved for future use.
- Password Salt: Salt used for PBKDF2 when deriving a key from a password.
- Password IV: AES-GCM IV used when encrypting the master key with the password-derived key.
- Password Encrypted Master Key: Master key encrypted under the password-derived key using AES-256-GCM (32 bytes ciphertext + 16 bytes auth tag = 48 bytes).
- Recovery Salt / IV / Encrypted Master Key: Equivalent fields for an alternate recovery path. If that path is unused, these fields are zero.
- User Data: The remainder of the file; encrypted using the unlocked master key.

