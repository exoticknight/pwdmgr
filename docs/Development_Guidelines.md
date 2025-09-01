# Development Guidelines

## 🚨 Language & Code Standards

### Language Requirements

- **ALL documentation must be in English only**
- **ALL code comments must be in English only**
- **ALL commit messages must be in English only**
- **ALL variable names and function names must be in English**

### Code Standards

- Use TypeScript for type safety
- Follow Svelte 5 patterns and conventions
- Maintain clean architecture separation
- Use meaningful English names for all identifiers
- Add JSDoc comments for public APIs
- **Use JavaScript private field syntax (#) for true encapsulation**

### Private Fields Standard

- **ALWAYS use JavaScript private field syntax with # for private properties**
- **NEVER use TypeScript private keyword - it provides no runtime protection**

```typescript
class ServiceExample {
  // ✅ Correct: True private field
  #privateData: string

  // ❌ Wrong: TypeScript private (no runtime protection)
  private privateData: string

  constructor() {
    this.#privateData = 'secret'
  }
}
```

### Import Standards

- **ALWAYS use the @alias for importing from src/**
- **Use relative imports only for same-level or child modules**

```typescript
// ✅ Correct: Use @alias for types, constants, utils from src/
import type { StoredKeyData } from '@/types/crypto'
import { ENCRYPTION_CONFIG } from '@/consts/encryption'
import { someUtil } from '@/utils/helper'

// ✅ Correct: Relative import for same-level services
import { getIoService } from './io'
import { getKeyService } from './key'

// ❌ Wrong: Relative import for different directories
import type { StoredKeyData } from '../types/crypto'
import { ENCRYPTION_CONFIG } from '../consts/encryption'
```

## 📁 File Organization Standards

### Services Layer

- **`services/app.ts`** - Application coordinator and business logic

### Configuration & Types

- **`consts/`** - Application-wide constants and configuration
- **`types/`** - TypeScript interface and type definitions

### Security Standards

- **Sensitive Data**: Must be stored in JavaScript private fields only
- **Business Logic**: Centralized in appropriate domain services
- **No Data Leakage**: Sensitive values never in function parameters/returns
- **Auto Cleanup**: Implement automatic cleanup for sensitive resources

## 📝 Commit Standards

Use conventional commit format in English:

- `feat: add navigation customization types`
- `fix: resolve circular dependency in navigation`
- `docs: update implementation status`
- `refactor: move constants to dedicated directory`

---

**Remember: Consistency in English usage and secure architecture patterns are essential for maintainable, professional code.**
