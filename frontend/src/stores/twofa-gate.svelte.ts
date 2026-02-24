import type { VerifyResult } from '@/services/app-2fa'
import { authenticate, generateAuthenticationOptions } from '@/services/fido'
import { app2FA } from '@/stores/app-2fa.svelte'
import { auth } from '@/stores/auth.svelte'
import { setting } from '@/stores/setting.svelte'

interface Provider {
  verify: (code: string) => Promise<VerifyResult>
  verifyBackup: (code: string) => Promise<VerifyResult>
}

class TwoFAGate {
  isOpen = $state(false)
  provider: Provider | null = $state(null)
  #resolver: ((ok: boolean) => void) | null = null
  isFidoMode = $state(false)
  fidoDeviceId = $state<string | null>(null)

  async verify(provider?: Provider): Promise<boolean> {
    // Check if FIDO second factor is enabled and has devices
    const fidoEnabled = setting.data.security.fidoEnabled
    const fidoAsSecondFactor = setting.data.security.fidoAsSecondFactor
    const fidoDevices = auth.fidoDevicesList

    if (fidoEnabled && fidoAsSecondFactor && fidoDevices.length > 0) {
      // Use FIDO instead of TOTP
      return this.verifyWithFido()
    }

    // Fall back to TOTP
    if (!app2FA.enabled) {
      return true
    }
    if (this.isOpen) {
      return false
    }
    // Cleanup expired lockout before showing the gate
    app2FA.cleanupExpiredLockout()
    this.provider = provider ?? app2FA
    this.isFidoMode = false
    this.isOpen = true
    return new Promise<boolean>((resolve) => {
      this.#resolver = resolve
    })
  }

  async verifyWithFido(): Promise<boolean> {
    if (this.isOpen) {
      return false
    }

    const fidoDevices = auth.fidoDevicesList
    if (fidoDevices.length === 0) {
      return false
    }

    this.isFidoMode = true

    // Single device - auto authenticate
    if (fidoDevices.length === 1) {
      this.fidoDeviceId = fidoDevices[0].id
      return this.doFidoAuth(fidoDevices[0].id)
    }

    // Multiple devices - show selection
    this.isOpen = true
    return new Promise<boolean>((resolve) => {
      this.#resolver = resolve
    })
  }

  async doFidoAuth(deviceId: string): Promise<boolean> {
    try {
      // Find the device to get credentialId
      const device = auth.fidoDevicesList.find(d => d.id === deviceId)
      if (!device) {
        console.error('FIDO device not found')
        this.resolve(false)
        return false
      }

      const options = generateAuthenticationOptions(device.credentialId)
      const response = await authenticate(options)

      if (response && response.id) {
        this.resolve(true)
        return true
      }
      else {
        this.resolve(false)
        return false
      }
    }
    catch (error) {
      console.error('FIDO verification failed:', error)
      this.resolve(false)
      return false
    }
  }

  async selectFidoDevice(deviceId: string): Promise<void> {
    this.fidoDeviceId = deviceId
    await this.doFidoAuth(deviceId)
  }

  resolve(ok: boolean) {
    if (this.#resolver) {
      this.#resolver(ok)
    }
    this.#resolver = null
    this.provider = null
    this.isOpen = false
    this.isFidoMode = false
    this.fidoDeviceId = null
  }
}

export const twoFAGate = new TwoFAGate()
