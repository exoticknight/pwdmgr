import type { VerifyResult } from '@/services/app-2fa'
import { app2FA } from '@/stores/app-2fa.svelte'

interface Provider {
  verify: (code: string) => Promise<VerifyResult>
  verifyBackup: (code: string) => Promise<VerifyResult>
}

class TwoFAGate {
  isOpen = $state(false)
  provider: Provider | null = $state(null)
  #resolver: ((ok: boolean) => void) | null = null

  async verify(provider?: Provider): Promise<boolean> {
    if (!app2FA.enabled) {
      return true
    }
    if (this.isOpen) {
      return false
    }
    // Cleanup expired lockout before showing the gate
    app2FA.cleanupExpiredLockout()
    this.provider = provider ?? app2FA
    this.isOpen = true
    return new Promise<boolean>((resolve) => {
      this.#resolver = resolve
    })
  }

  resolve(ok: boolean) {
    if (this.#resolver) {
      this.#resolver(ok)
    }
    this.#resolver = null
    this.provider = null
    this.isOpen = false
  }
}

export const twoFAGate = new TwoFAGate()
