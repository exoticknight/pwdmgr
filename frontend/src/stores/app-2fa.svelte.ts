import type { TwoFactorAuthConfig } from '@/types/setting'
import {
  calculateLockout,
  generateBackupCodes,
  generateQRCodeUri,
  generateSecret,
  hashBackupCodes,
  isLockedOut,
  isReplayCode,
  verifyBackupCode,
  verifyCode,
} from '@/services/app-2fa'
import { setting } from './setting.svelte'

interface PendingSetup {
  secret: string
  qrUri: string
  backupCodes: string[] // plain text codes (shown to user once)
}

class App2FAStore {
  #pendingSetup = $state<PendingSetup | null>(null)

  get pendingSetup() {
    return this.#pendingSetup
  }

  get enabled(): boolean {
    return setting.getSetting('security.twoFactorAuth')?.enabled === true
  }

  get config(): TwoFactorAuthConfig | undefined {
    return setting.getSetting('security.twoFactorAuth')
  }

  get failedAttempts(): number {
    return this.config?.failedAttempts ?? 0
  }

  get lockedUntil(): number | undefined {
    return this.config?.lockedUntil
  }

  get isLocked(): boolean {
    return isLockedOut(this.config?.lockedUntil)
  }

  /**
   * Start the 2FA setup process. Generates a new secret, QR URI, and backup codes.
   */
  startSetup(accountLabel: string = 'user'): PendingSetup {
    const secret = generateSecret()
    const qrUri = generateQRCodeUri(secret, accountLabel)
    const backupCodes = generateBackupCodes()

    this.#pendingSetup = { secret, qrUri, backupCodes }
    return this.#pendingSetup
  }

  /**
   * Verify the user's first TOTP code during setup and persist the 2FA config.
   * Returns true if verified and saved. Does NOT clear pendingSetup so backup codes remain visible.
   */
  async completeSetup(verificationCode: string): Promise<boolean> {
    if (!this.#pendingSetup) {
      throw new Error('No pending 2FA setup')
    }

    const isValid = verifyCode(this.#pendingSetup.secret, verificationCode)
    if (!isValid) {
      return false
    }

    const hashedCodes = await hashBackupCodes(this.#pendingSetup.backupCodes)

    const config: TwoFactorAuthConfig = {
      enabled: true,
      secret: this.#pendingSetup.secret,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      backupCodes: hashedCodes,
      failedAttempts: 0,
    }

    setting.updateSetting('security.twoFactorAuth', config)
    // NOTE: pendingSetup is intentionally NOT cleared here
    // so backup codes remain visible in the setup wizard.
    return true
  }

  /**
   * Finalize the 2FA setup by clearing the pending state.
   * Call this after the user has saved their backup codes.
   */
  finalizeSetup(): void {
    this.#pendingSetup = null
  }

  /**
   * Cancel an in-progress 2FA setup
   */
  cancelSetup(): void {
    this.#pendingSetup = null
  }

  /**
   * Verify a TOTP code during login/unlock
   */
  verify(code: string): boolean {
    const cfg = this.config
    if (!cfg?.enabled) {
      return true // 2FA not enabled, pass through
    }

    // Check lockout
    if (isLockedOut(cfg.lockedUntil)) {
      return false
    }

    // Check replay
    if (isReplayCode(code, cfg.lastUsedCode)) {
      this.#recordFailure()
      return false
    }

    const isValid = verifyCode(cfg.secret, code, cfg.algorithm, cfg.digits, cfg.period)

    if (isValid) {
      setting.updateSetting('security.twoFactorAuth', {
        ...cfg,
        lastUsedCode: code,
        failedAttempts: 0,
        lockedUntil: undefined,
      })
      return true
    }

    this.#recordFailure()
    return false
  }

  /**
   * Verify a backup code during login/unlock.
   * Consumes the code on success.
   */
  async verifyBackup(code: string): Promise<boolean> {
    const cfg = this.config
    if (!cfg?.enabled) {
      return true
    }

    if (isLockedOut(cfg.lockedUntil)) {
      return false
    }

    const index = await verifyBackupCode(code, cfg.backupCodes)
    if (index === -1) {
      this.#recordFailure()
      return false
    }

    // Consume the backup code
    const updatedCodes = [...cfg.backupCodes]
    updatedCodes.splice(index, 1)

    setting.updateSetting('security.twoFactorAuth', {
      ...cfg,
      backupCodes: updatedCodes,
      failedAttempts: 0,
      lockedUntil: undefined,
    })

    return true
  }

  /**
   * Disable 2FA (requires password validation to be done by the caller)
   */
  disable(): void {
    setting.updateSetting('security.twoFactorAuth', undefined)
  }

  /**
   * Regenerate backup codes. Returns the new plain-text codes.
   */
  async regenerateBackupCodes(): Promise<string[]> {
    const cfg = this.config
    if (!cfg?.enabled) {
      throw new Error('2FA is not enabled')
    }

    const newCodes = generateBackupCodes()
    const hashed = await hashBackupCodes(newCodes)

    setting.updateSetting('security.twoFactorAuth', {
      ...cfg,
      backupCodes: hashed,
    })

    return newCodes
  }

  #recordFailure(): void {
    const cfg = this.config
    if (!cfg) {
      return
    }

    const newAttempts = cfg.failedAttempts + 1
    const lockedUntil = calculateLockout(newAttempts)

    setting.updateSetting('security.twoFactorAuth', {
      ...cfg,
      failedAttempts: newAttempts,
      lockedUntil,
    })
  }
}

export const app2FA = new App2FAStore()
