import type { VerifyResult } from '@/services/app-2fa'
import type { TwoFactorAuthConfig } from '@/types/setting'
import {
  calculateLockout,
  generateBackupCodes,
  generateQRCodeUri,
  generateSecret,
  getLockoutRemainingSeconds,
  hashBackupCodes,
  isLockoutExpired,
  isLockedOut,
  isReplayCode,
  verifyBackupCode,
  verifyCode,

} from '@/services/app-2fa'
import { decryptTextWithMasterKey } from '@/services/key'
import { fromBase64, toBase64 } from '@/utils/uin8array'
import { auth } from './auth.svelte'
import { setting } from './setting.svelte'

interface PendingSetup {
  secret: string
  qrUri: string
  backupCodes: string[] // plain text codes (shown to user once)
}

class App2FAStore {
  #pendingSetup = $state<PendingSetup | null>(null)

  // 响应式锁定状态
  #lockoutState = $state({
    isLocked: false,
    remainingSeconds: 0,
    failedAttempts: 0,
  })

  // 倒计时定时器
  #countdownTimer: number | null = null

  constructor() {
    this.#initLockoutState()
  }

  get pendingSetup() {
    return this.#pendingSetup
  }

  get enabled(): boolean {
    return setting.getSetting('security.twoFactorAuth')?.enabled === true
  }

  get config(): TwoFactorAuthConfig | undefined {
    return setting.getSetting('security.twoFactorAuth')
  }

  // 响应式属性
  get isLocked(): boolean {
    return this.#lockoutState.isLocked
  }

  get remainingSeconds(): number {
    return this.#lockoutState.remainingSeconds
  }

  get failedAttempts(): number {
    return this.#lockoutState.failedAttempts
  }

  // 初始化锁定状态
  #initLockoutState() {
    const cfg = this.config
    if (!cfg) return

    if (isLockedOut(cfg.lockedUntil)) {
      // 有未过期的锁定，启动倒计时
      this.#startCountdown(cfg.lockedUntil!)
    } else if (isLockoutExpired(cfg.lockedUntil)) {
      // 清理过期锁定
      this.#clearLockout()
    } else {
      // 正常状态
      this.#lockoutState = {
        isLocked: false,
        remainingSeconds: 0,
        failedAttempts: cfg.failedAttempts,
      }
    }
  }

  // 启动倒计时
  #startCountdown(lockedUntil: number) {
    this.#stopCountdown()

    const update = () => {
      const remaining = getLockoutRemainingSeconds(lockedUntil)
      if (remaining > 0) {
        this.#lockoutState = {
          isLocked: true,
          remainingSeconds: remaining,
          failedAttempts: 5, // 锁定时显示已用完5次
        }
      } else {
        // 锁定结束
        this.#stopCountdown()
        this.#clearLockout()
      }
    }

    update()
    this.#countdownTimer = window.setInterval(update, 1000)
  }

  // 停止倒计时
  #stopCountdown() {
    if (this.#countdownTimer !== null) {
      clearInterval(this.#countdownTimer)
      this.#countdownTimer = null
    }
  }

  // 清理过期锁定
  #clearLockout() {
    const cfg = this.config
    if (cfg && isLockoutExpired(cfg.lockedUntil)) {
      setting.updateSetting('security.twoFactorAuth', {
        ...cfg,
        failedAttempts: 0,
        lockedUntil: undefined,
      })
    }
    this.#lockoutState = {
      isLocked: false,
      remainingSeconds: 0,
      failedAttempts: 0,
    }
  }

  /**
   * Force cleanup expired lockout (can be called externally)
   */
  cleanupExpiredLockout(): void {
    this.#clearLockout()
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
    const encryptedSecret = await auth.encryptData(this.#pendingSetup.secret)
    const secretEnc = toBase64(encryptedSecret)
    encryptedSecret.fill(0)

    const config: TwoFactorAuthConfig = {
      enabled: true,
      secretEnc,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      backupCodes: hashedCodes,
      failedAttempts: 0,
    }

    setting.updateSetting('security.twoFactorAuth', config)
    this.#pendingSetup = {
      ...this.#pendingSetup,
      secret: '',
      qrUri: '',
    }
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
  async verify(code: string): Promise<VerifyResult> {
    let cfg = this.config
    if (!cfg?.enabled) {
      return { ok: true }
    }

    // Check lockout - if expired, clear it first
    if (isLockoutExpired(cfg.lockedUntil)) {
      cfg = {
        ...cfg,
        failedAttempts: 0,
        lockedUntil: undefined,
      }
      setting.updateSetting('security.twoFactorAuth', cfg)
    }
    else if (isLockedOut(cfg.lockedUntil)) {
      return { ok: false, reason: 'LOCKED' }
    }

    // Check replay
    if (isReplayCode(code, cfg.lastUsedCode)) {
      this.#recordFailure()
      return { ok: false, reason: 'INVALID_CODE' }
    }

    let secret = ''
    try {
      secret = await auth.decryptData(fromBase64(cfg.secretEnc))
      const isValid = verifyCode(secret, code, cfg.algorithm, cfg.digits, cfg.period)

      if (isValid) {
        setting.updateSetting('security.twoFactorAuth', {
          ...cfg,
          lastUsedCode: code,
          failedAttempts: 0,
          lockedUntil: undefined,
        })
        this.#onVerifySuccess()
        return { ok: true }
      }

      this.#recordFailure()
      return { ok: false, reason: 'INVALID_CODE' }
    }
    finally {
      secret = ''
    }
  }

  async verifyWithMasterKey(masterKey: Uint8Array, code: string): Promise<VerifyResult> {
    let cfg = this.config
    if (!cfg?.enabled) {
      return { ok: true }
    }

    // Check lockout - if expired, clear it first
    if (isLockoutExpired(cfg.lockedUntil)) {
      cfg = {
        ...cfg,
        failedAttempts: 0,
        lockedUntil: undefined,
      }
      setting.updateSetting('security.twoFactorAuth', cfg)
    }
    else if (isLockedOut(cfg.lockedUntil)) {
      return { ok: false, reason: 'LOCKED' }
    }

    if (isReplayCode(code, cfg.lastUsedCode)) {
      this.#recordFailure()
      return { ok: false, reason: 'INVALID_CODE' }
    }

    let secret = ''
    try {
      secret = await decryptTextWithMasterKey(masterKey, fromBase64(cfg.secretEnc))
      const isValid = verifyCode(secret, code, cfg.algorithm, cfg.digits, cfg.period)

      if (isValid) {
        setting.updateSetting('security.twoFactorAuth', {
          ...cfg,
          lastUsedCode: code,
          failedAttempts: 0,
          lockedUntil: undefined,
        })
        this.#onVerifySuccess()
        return { ok: true }
      }

      this.#recordFailure()
      return { ok: false, reason: 'INVALID_CODE' }
    }
    finally {
      secret = ''
    }
  }

  /**
   * Verify a backup code during login/unlock.
   * Consumes the code on success.
   */
  async verifyBackup(code: string): Promise<VerifyResult> {
    let cfg = this.config
    if (!cfg?.enabled) {
      return { ok: true }
    }

    // Check lockout - if expired, clear it first
    if (isLockoutExpired(cfg.lockedUntil)) {
      cfg = {
        ...cfg,
        failedAttempts: 0,
        lockedUntil: undefined,
      }
      setting.updateSetting('security.twoFactorAuth', cfg)
    }
    else if (isLockedOut(cfg.lockedUntil)) {
      return { ok: false, reason: 'LOCKED' }
    }

    const index = await verifyBackupCode(code, cfg.backupCodes)
    if (index === -1) {
      this.#recordFailure()
      return { ok: false, reason: 'INVALID_CODE' }
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

    this.#onVerifySuccess()
    return { ok: true }
  }

  async verifyBackupWithMasterKey(_masterKey: Uint8Array, code: string): Promise<VerifyResult> {
    return this.verifyBackup(code)
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

    // 如果触发了锁定，启动倒计时
    if (lockedUntil) {
      this.#startCountdown(lockedUntil)
    } else {
      // 未锁定，更新失败次数响应式状态
      this.#lockoutState = {
        isLocked: false,
        remainingSeconds: 0,
        failedAttempts: newAttempts,
      }
    }
  }

  // 验证成功后更新响应式状态
  #onVerifySuccess() {
    this.#stopCountdown()
    this.#lockoutState = {
      isLocked: false,
      remainingSeconds: 0,
      failedAttempts: 0,
    }
  }
}

export const app2FA = new App2FAStore()
