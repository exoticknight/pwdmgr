# bei3mat6 (Password Manager) - Agent Documentation

## Project Overview

**bei3mat6** (also written as B3M6, Chinese: 密码) is a secure, local-first password manager desktop application built with [Wails](https://wails.io/) framework. It stores encrypted password data locally in a custom binary file format (.pwd files) with client-side encryption.

### Key Features

- **Multiple Entry Types**: Passwords, encrypted text, TOTP/2FA codes, payment cards, phone numbers
- **Strong Encryption**: AES-256-GCM with PBKDF2 key derivation (500,000 iterations)
- **2FA/TOTP Support**: Generate and manage time-based one-time passwords with QR code scanning
- **Import/Export**: Import from Bitwarden, KeePass, LastPass, Chrome/Firefox/Edge; export to CSV/JSON
- **Multi-language**: English, Chinese (Simplified), Japanese
- **Themes**: Light, dark, and system-following themes
- **Auto-lock**: Configurable automatic application locking for security
- **Navigation Customization**: Users can reorder and show/hide navigation items
- **Recovery Codes**: Optional recovery code generation for password reset

## Technology Stack

### Backend (Go)

| Component | Version | Purpose |
|-----------|---------|---------|
| Go | 1.23 | Runtime |
| Wails | v2.11.0 | Cross-platform desktop app framework |

**Backend Role**: Minimal - only handles file I/O dialogs and file system operations. All business logic and encryption happens in the frontend.

### Frontend (TypeScript/Svelte)

| Component | Version | Purpose |
|-----------|---------|---------|
| Svelte | 5.x | UI framework (using runes: `$state`, `$derived`, etc.) |
| TypeScript | 5.9.x | Type safety |
| Vite | 7.x | Build tool |
| Tailwind CSS | 4.x | Utility-first CSS |
| DaisyUI | 5.x | UI component library |
| i18next | 25.x | Internationalization |
| otpauth | 9.x | TOTP/HOTP algorithm implementation |
| Fuse.js | 7.x | Fuzzy search |
| layerchart | 2.x | Charting library |
| lean-qr | 2.x | QR code generation |
| qr-scanner | 1.x | QR code scanning |

### Package Manager

- **pnpm** is used for frontend dependency management

## Project Structure

```
bei3mat6/
├── internal/                  # Go backend code
│   ├── app.go                # Main app struct and lifecycle
│   └── file_service.go       # File dialog and file operations service
├── frontend/                  # Frontend code
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page-level components
│   │   │   ├── landing/      # Login/unlock screen
│   │   │   ├── main/         # Main app layout with navigation
│   │   │   ├── items/        # Password entries management
│   │   │   ├── import/       # Import from other managers
│   │   │   ├── audit/        # Security audit features
│   │   │   └── setting/      # App settings
│   │   ├── services/         # Business logic services
│   │   │   ├── file.ts       # File format handling
│   │   │   ├── key.ts        # Encryption/decryption service
│   │   │   └── io.ts         # Go backend communication
│   │   ├── stores/           # Svelte 5 reactive state stores
│   │   │   ├── data.svelte.ts       # Password entries data
│   │   │   ├── auth.svelte.ts       # Authentication state
│   │   │   ├── database.svelte.ts   # Database file state
│   │   │   ├── setting.svelte.ts    # User settings
│   │   │   └── ...
│   │   ├── types/            # TypeScript type definitions
│   │   │   ├── data.ts       # Entry data types (Datum, PasswordData, etc.)
│   │   │   ├── crypto.ts     # Encryption-related types
│   │   │   └── ...
│   │   ├── utils/            # Utility functions
│   │   ├── consts/           # Application constants
│   │   ├── i18n/             # Internationalization
│   │   ├── assets/           # Static assets (fonts, images)
│   │   ├── global.css        # Global styles
│   │   ├── main.ts           # Entry point
│   │   └── app.svelte        # Root component
│   ├── wailsjs/              # Wails-generated Go bindings
│   ├── package.json
│   ├── vite.config.ts
│   ├── svelte.config.js
│   └── tsconfig.json
├── docs/                      # Documentation
│   ├── Development_Guidelines.md
│   ├── File_Structure.md
│   └── 2FA_Implementation_Plan.md
├── build/                     # Build assets
├── main.go                    # Go entry point
├── go.mod                     # Go dependencies
├── wails.json                 # Wails configuration
└── .editorconfig              # Editor configuration
```

## Build and Development Commands

### Prerequisites

- Go 1.23 or later
- Node.js (for pnpm)
- pnpm
- Wails CLI (`go install github.com/wailsapp/wails/v2/cmd/wails@latest`)

### Development

```bash
# Run in live development mode with hot reload
wails dev

# The dev server also runs on http://localhost:34115 for browser testing
```

### Building

```bash
# Build production binary
wails build

# Build for Windows
wails build -platform windows

# Build for macOS
wails build -platform darwin

# Build for Linux
wails build -platform linux
```

### Frontend-only Commands (run from `frontend/` directory)

```bash
cd frontend

# Install dependencies
pnpm install

# Run Vite dev server
pnpm dev

# Build frontend
pnpm build

# Type checking
pnpm check

# Linting
pnpm lint
pnpm lint:fix
```

## Code Style Guidelines

### Language Requirements

- **ALL documentation must be in English**
- **ALL code comments must be in English**
- **ALL commit messages must be in English**
- **ALL variable names and function names must be in English**

### Private Fields

Always use JavaScript private field syntax (`#`) for private properties. **Never use TypeScript `private` keyword** as it provides no runtime protection.

```typescript
// ✅ Correct: True private field
class ServiceExample {
  #privateData: string

  constructor() {
    this.#privateData = 'secret'
  }
}

// ❌ Wrong: TypeScript private (no runtime protection)
class ServiceExample {
  private privateData: string
}
```

### Import Standards

- **ALWAYS use the `@/` alias for importing from `src/`**
- **Use relative imports only for same-level or child modules**

```typescript
// ✅ Correct: Use @alias for types, constants, utils from src/
import type { KeyData } from '@/types/crypto'
import { ENCRYPTION_CONFIG } from '@/consts/encryption'
import { someUtil } from '@/utils/helper'

// ✅ Correct: Relative import for same-level services
import { getIoService } from './io'
import { getKeyService } from './key'

// ❌ Wrong: Relative import for different directories
import type { KeyData } from '../types/crypto'
import { ENCRYPTION_CONFIG } from '../consts/encryption'
```

### Editor Configuration

The project uses `.editorconfig`:
- Charset: UTF-8
- Indent: 2 spaces
- Line ending: LF
- Trim trailing whitespace

## Key Architecture Details

### Encryption Architecture

1. **Master Key**: Random 32-byte key generated on database creation
2. **Password-derived Key**: PBKDF2 (SHA-512, 500,000 iterations) derives key from user password
3. **Master Key Encryption**: Master key is encrypted with password-derived key using AES-256-GCM
4. **Data Encryption**: User data is encrypted with the master key using AES-256-GCM
5. **Recovery Code**: Optional 32-character recovery code can also decrypt the master key

See `frontend/src/consts/encryption.ts` for configuration.

### File Format

Custom binary format with:
- 8-byte header (magic bytes + version)
- 184-byte key data section (encrypted master keys)
- Variable-length encrypted user data

See `docs/File_Structure.md` and `frontend/src/consts/file-format.ts`.

### Data Types

Entry types supported (`frontend/src/types/data.ts`):

| Type | Constant | Description |
|------|----------|-------------|
| Password | `password` | Login credentials |
| Encrypted Text | `encrypted_text` | Secure notes |
| 2FA/TOTP | `two_factor_auth` | TOTP authenticator codes |
| Payment | `payment` | Credit/debit card info |
| Phone | `phone` | Phone numbers |

### State Management

Uses Svelte 5 runes for reactive state:
- `$state()` for reactive variables
- `$derived()` for computed values
- `$effect()` for side effects
- `$state.snapshot()` for immutable copies

Stores are organized by domain in `frontend/src/stores/`:
- `data.svelte.ts` - Password entries
- `auth.svelte.ts` - Authentication state
- `database.svelte.ts` - Database file operations
- `setting.svelte.ts` - User settings
- `navigation.svelte.ts` - Navigation state

### Go-Frontend Communication

Go services are bound to frontend via Wails:
- `internal.App` - Application lifecycle
- `internal.FileService` - File dialogs and file I/O

Bindings auto-generated in `frontend/wailsjs/go/`.

## Testing Strategy

Currently, the project relies on:
- TypeScript type checking via `svelte-check`
- ESLint for code quality
- Manual testing during development

**Note**: No automated test suite is currently implemented. Consider adding:
- Unit tests for encryption/decryption logic
- Unit tests for TOTP generation
- Integration tests for import/export functionality

## Security Considerations

### Implemented

- Client-side encryption (data encrypted before leaving the app)
- PBKDF2 with high iteration count (500,000)
- AES-256-GCM authenticated encryption
- Automatic memory clearing of sensitive data (master key)
- Auto-lock after inactivity
- Recovery codes for password reset
- Context menu disabled to prevent accidental data exposure
- Text selection disabled except in input fields

### Best Practices for Contributors

- Never log sensitive data (passwords, keys)
- Use private fields (`#`) for sensitive data in classes
- Clear sensitive data from memory when no longer needed
- Validate all file inputs for the expected format
- Sanitize any user-generated content before display

## Common Tasks

### Adding a New Entry Type

1. Add type constant to `frontend/src/types/data.ts` in `DataMetaType`
2. Create interface extending `BasicData`
3. Update `Datum` union type
4. Add form components in `frontend/src/pages/items/{type}/`
5. Update entry type utilities in `frontend/src/utils/entry-types.ts`
6. Add i18n translations to locale files
7. Update navigation constants if needed

### Adding a New Setting

1. Add setting type to `frontend/src/types/setting.ts`
2. Add default value to `frontend/src/consts/setting.ts`
3. Update `setting.svelte.ts` store
4. Add UI in appropriate settings page
5. Add i18n translations

### Adding Import Support for New Format

1. Create importer in `frontend/src/pages/import/importers/{name}.ts`
2. Implement parser following existing patterns
3. Add to import page UI
4. Add example file and instructions

## Dependencies of Note

| Package | Purpose |
|---------|---------|
| `otpauth` | TOTP/HOTP algorithm implementation |
| `lean-qr` | QR code generation |
| `qr-scanner` | QR code scanning from images |
| `fuse.js` | Fuzzy search for entries |
| `papaparse` | CSV parsing for import/export |
| `date-fns` | Date formatting utilities |
| `mathjs` | Mathematical operations for password generator |
| `layerchart` | Charts for audit/statistics pages |
| `@lucide/svelte` | Icon library |
| `@mateothegreat/svelte5-router` | Client-side routing |
| `typia` | Runtime type validation |

## Deployment

The application is distributed as a native desktop executable:

- **Windows**: `.exe` file
- **macOS**: `.app` bundle
- **Linux**: Executable binary

Build artifacts are created by `wails build` command.

## Additional Documentation

- `docs/Development_Guidelines.md` - Detailed coding standards
- `docs/File_Structure.md` - Binary file format specification
- `docs/2FA_Implementation_Plan.md` - 2FA feature implementation details
