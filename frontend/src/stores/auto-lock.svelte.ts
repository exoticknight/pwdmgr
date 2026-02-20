import type { VerifyResult } from '@/services/app-2fa'
import type { KeyData } from '@/types/crypto'
import { app2FA } from './app-2fa.svelte'
import { auth } from './auth.svelte'
import { setting } from './setting.svelte'

let timerId = $state<number | null>(null)
let intervalId = $state<number | null>(null)
let remainingTime = $state(0)
const enableLock = $derived(setting.getSetting('security.autoLock'))
const autoLockTime = $derived(setting.getSetting('security.autoLockTime'))

class AutoLock {
  shouldLock = $derived(!auth.isAuthed)
  isLocked = $state(false)

  #keyData: KeyData | null = null
  #pendingMasterKey: Uint8Array | null = null

  get isAutoLockEnabled(): boolean {
    return enableLock && !this.shouldLock
  }

  get formattedTime(): string {
    if (!enableLock || remainingTime <= 0 || this.shouldLock) {
      return ''
    }
    const mins = Math.floor(remainingTime / 60)
    const secs = remainingTime % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  startTimer() {
    this.clearTimer()

    if (!enableLock || this.shouldLock) {
      return
    }

    // autoLockTime is in minutes, convert to milliseconds
    const timeoutMs = autoLockTime * 60 * 1000
    remainingTime = Math.floor(timeoutMs / 1000)

    timerId = window.setTimeout(() => {
      this.lock()
    }, timeoutMs)

    intervalId = window.setInterval(() => {
      remainingTime--
      if (remainingTime <= 0) {
        this.clearTimer()
        this.lock()
      }
    }, 1000)
  }

  clearTimer() {
    if (timerId !== null) {
      clearTimeout(timerId)
      timerId = null
    }
    if (intervalId !== null) {
      clearInterval(intervalId)
      intervalId = null
    }
    remainingTime = 0
  }

  async verifyPassword(password: string) {
    if (this.#pendingMasterKey) {
      this.#pendingMasterKey.fill(0)
      this.#pendingMasterKey = null
    }
    this.#pendingMasterKey = await auth.decryptMasterKey(password, this.#keyData!)
  }

  async verify2FA(code: string): Promise<VerifyResult> {
    if (!this.#pendingMasterKey) {
      return { ok: false, reason: 'LOCKED' }
    }
    return app2FA.verifyWithMasterKey(this.#pendingMasterKey, code)
  }

  async verify2FABackup(code: string): Promise<VerifyResult> {
    if (!this.#pendingMasterKey) {
      return { ok: false, reason: 'LOCKED' }
    }
    return app2FA.verifyBackupWithMasterKey(this.#pendingMasterKey, code)
  }

  completeLock() {
    if (!this.#pendingMasterKey) {
      throw new Error('locked')
    }
    auth.authWithMasterKey(this.#pendingMasterKey, this.#keyData!)
    this.#pendingMasterKey.fill(0)
    this.#pendingMasterKey = null
    this.isLocked = false
    this.clearTimer()
    if (enableLock) {
      this.startTimer()
    }
  }

  async unlock(password: string) {
    await auth.auth(password, this.#keyData!)
    this.isLocked = false

    this.clearTimer()
    if (enableLock) {
      this.startTimer()
    }
  }

  lock() {
    this.clearTimer()
    this.#keyData = auth.keyData
    if (this.#pendingMasterKey) {
      this.#pendingMasterKey.fill(0)
      this.#pendingMasterKey = null
    }
    auth.unauth()
    this.isLocked = true
  }
}

export const autoLock = new AutoLock()
