# Master Password Recovery - Technical Specification

## 📋 Overview

This document defines the technical specification for the master password recovery feature implementation. The system uses a dual-layer encryption approach with a shared master key that can be unlocked using either a password or a recovery code.

## 🏗️ Architecture Design

### Core Concept

**Dual-layer encryption with shared master key:**

```
User Data ↔ AES-256-GCM ↔ Master Key (32 random bytes)
                            ↕
                    Password OR Recovery Code
```

### Security Model

**Encryption Configuration:**
- Algorithm: AES-256-GCM
- Key Derivation: PBKDF2-SHA-512, 500K iterations
- Master Key: 32 cryptographically secure random bytes
- Recovery Code: 32 cryptographically secure random bytes
- All salts/IVs: Cryptographically secure random

**Security Properties:**
- Recovery code is one-time use (invalidated after successful recovery)
- Force password reset after recovery
- Master key cleared from memory after use
- No timing attack vulnerabilities
- Complete data isolation using JavaScript private fields

## 📁 File Format Specification

### 8-Byte File Header + 184-Byte Key Data Section (total 192 bytes)
```
Offset   Size  Content
0-3      4     Magic Bytes (file header)
4-5      2     Version
6-7      2     Reserved

// Key data section (starts at offset 8, length 184 bytes)
8-39     32    Password Salt
40-51    12    Password IV
52-99    48    Password Encrypted Master Key (32 data + 16 auth tag)
100-131  32    Recovery Salt (zero if disabled)
132-143  12    Recovery IV (zero if disabled)
144-191  48    Recovery Encrypted Master Key (zero if disabled)

192+     Var   User Data (encrypted with master key)
```

### Data Types

```typescript
// 实际代码实现采用 Uint8Array 类型，便于二进制处理
export interface KeyData {
  passwordSalt: Uint8Array      // 32 bytes
  passwordIv: Uint8Array        // 12 bytes
  passwordEncryptedMasterKey: Uint8Array // 48 bytes
  recoverySalt: Uint8Array      // 32 bytes (zero if disabled)
  recoveryIv: Uint8Array        // 12 bytes (zero if disabled)
  recoveryEncryptedMasterKey: Uint8Array // 48 bytes (zero if disabled)
}

export interface FileStructure {
  userData: Uint8Array
  keyData: KeyData
}

export interface RecoveryConfig {
  enabled: boolean
  version: number
}
```

## 🔐 Core Services Implementation

### KeyService (Cryptographic Black Box)

**Responsibilities:**
- Private storage of master key using JavaScript `#` private fields
- All encryption/decryption operations
- Automatic security mechanisms (5-minute auto-lock, memory cleanup)

**Key Methods:**
```typescript
interface KeyService {
  authenticateWithPassword(keyData: StoredKeyData, password: string): Promise<boolean>
  authenticateWithRecovery(keyData: StoredKeyData, recoveryCode: string): Promise<boolean>
  encryptData(jsonString: string): Promise<ArrayBuffer>
  decryptData(encryptedData: ArrayBuffer): Promise<string>
  isUnlocked(): boolean
  lock(): void
}
```

### FileService (File Format Handler)

**Responsibilities:**
- 184-byte header file format processing
- File I/O operations
- Key data and user data separation/merging

**Key Methods:**
```typescript
interface FileService {
  readFile(filePath: string): Promise<ArrayBuffer>
  writeFile(filePath: string, data: ArrayBuffer): Promise<void>
  extractKeyData(fileData: ArrayBuffer): StoredKeyData
  combineKeyDataAndUserData(keyData: StoredKeyData, userData: ArrayBuffer): ArrayBuffer
}
```

### DataService (Application Coordinator)

**Responsibilities:**
- Coordinates KeyService and FileService
- Provides unified business logic interface
- Session management

**Key Methods:**
```typescript
interface DataService {
  authenticateWithPassword(filePath: string, password: string): Promise<boolean>
  authenticateWithRecovery(filePath: string, recoveryCode: string): Promise<boolean>
  loadData<T>(filePath: string): Promise<T>
  saveData<T>(filePath: string, data: T): Promise<void>
  enableRecovery(filePath: string, password: string): Promise<string>
  disableRecovery(filePath: string, password: string): Promise<void>
  isRecoveryAvailable(filePath: string): Promise<boolean>
  isUnlocked(): boolean
}
```

## 🎯 User Experience Flows

### Setup Flow
1. Settings → Security → "Setup Recovery Code"
2. System generates 32-byte recovery code and displays formatted
3. User saves code securely → Confirms → Recovery is enabled
4. Recovery code is stored encrypted in file header

### Recovery Flow
1. Login/unlock screen → "Use Recovery Code" button
2. User enters recovery code in modal → System validates
3. Access granted → System forces password reset → Recovery code invalidated

### Migration Flow
1. System detects old format → Generates master key from existing password
2. Migrates to new 184-byte header format → Preserves data integrity
3. User optionally sets up recovery code

## 🛡️ Security Features

### Automatic Protection
- **5-minute auto-lock**: Automatically clears master key after inactivity
- **Page unload cleanup**: Clears sensitive data when page is closed/refreshed
- **Memory safety**: Secure zeroing of sensitive data on lock
- **One-time recovery**: Recovery code becomes invalid after successful use

### Data Isolation
- **JavaScript Private Fields**: Master key stored in `#masterKey` field
- **No Parameter Passing**: Sensitive data never passed in function parameters
- **Centralized Operations**: All crypto operations happen within KeyService
- **Automatic Cleanup**: Guaranteed memory cleanup on errors

### Error Handling
- **No Information Leakage**: Error messages don't reveal sensitive information
- **Rate Limiting**: Prevents brute force attacks on recovery codes
- **Graceful Degradation**: Clear error reporting with recovery suggestions

## 🔄 Component Integration

### Secure Interface Pattern

Components never handle sensitive data directly:

```typescript
const dataService = getDataService()

// Authentication (one-time)
await dataService.authenticateWithPassword(filePath, password)

// Passwordless operations
const items = await dataService.loadData(filePath)
await dataService.saveData(filePath, updatedItems)

// State management (no sensitive data)
userState.isAuthenticated = dataService.isUnlocked()
userState.hasRecovery = await dataService.isRecoveryAvailable(filePath)
```

### Component Files

**Core Components:**
- `auth-actions.svelte` - Recovery modal + language selector
- `landing.svelte` - Login/unlock with recovery option
- `settings.svelte` - Recovery setup/disable UI

**Integration Points:**
- Settings: Add `masterPasswordRecovery: RecoveryConfig` to security section
- User Store: Add authentication state (no sensitive data)
- Pages: Use unified auth-actions component

## ⚡ Performance Considerations

### Crypto Operations
- **Key Derivation Caching**: PBKDF2 results cached to avoid redundant operations
- **Background Processing**: Heavy crypto operations don't block UI
- **Memory Management**: Automatic cleanup prevents memory leaks
- **Lazy Loading**: Services instantiated only when needed

### File Operations
- **Streaming**: Large files processed in chunks
- **Atomic Writes**: File operations are atomic to prevent corruption
- **Backup Strategy**: Temporary backups during migration

## 🧪 Testing Strategy

### Security Tests
- Master key isolation and memory clearing
- One-time recovery code enforcement
- Auto-lock timer functionality
- Data encryption/decryption round-trips

### Integration Tests
- End-to-end recovery setup and usage flows
- Database migration scenarios
- File format compliance (exact 184-byte positioning)
- Error handling for invalid codes and corruption

### Performance Tests
- PBKDF2 iteration time (should be under 5 seconds)
- Memory usage during crypto operations
- File I/O performance with various file sizes

---

**This specification provides the complete technical foundation for implementing the master password recovery feature with security-first design principles.**
