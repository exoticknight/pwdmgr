import type { KeyData } from '@/types/crypto'
import { auth } from './auth.svelte'
import { setting } from './setting.svelte'

let timerId = $state<number | null>(null)
const enableLock = $derived(setting.getSetting('security.autoLock'))
const autoLockTime = $derived(setting.getSetting('security.autoLockTime'))

class AutoLock {
  shouldLock = $derived(!auth.isAuthed)
  isLocked = $state(false)

  #keyData: KeyData | null = null

  startTimer() {
    this.clearTimer()

    if (!enableLock || this.shouldLock) {
      return
    }

    // in minutes
    const timeoutMs = autoLockTime * 1000

    timerId = window.setTimeout(() => {
      this.lock()
    }, timeoutMs)
  }

  clearTimer() {
    if (timerId !== null) {
      clearTimeout(timerId)
      timerId = null
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
    auth.unauth()
    this.isLocked = true
  }
}

export const autoLock = new AutoLock()
