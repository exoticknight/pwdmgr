import { app2FA } from '@/stores/app-2fa.svelte'

interface Provider {
  verify: (code: string) => Promise<boolean>
  verifyBackup: (code: string) => Promise<boolean>
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
