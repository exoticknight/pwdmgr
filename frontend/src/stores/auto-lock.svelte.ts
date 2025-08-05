import { setting } from './setting.svelte'
import { userState } from './user.svelte'

let isLocked = $state(false)
let timerId = $state<number | null>(null)
const shouldLock = $derived(setting.getSetting('security.autoLock'))
const autoLockTime = $derived(setting.getSetting('security.autoLockTime'))

export const autoLock = {
  get isLocked() {
    return isLocked
  },

  startTimer() {
    this.clearTimer()

    if (!shouldLock || !userState.password || isLocked) {
      return
    }

    // in minutes
    const timeoutMs = autoLockTime * 60 * 1000
    timerId = window.setTimeout(() => {
      isLocked = true
    }, timeoutMs)
  },

  clearTimer() {
    if (timerId !== null) {
      clearTimeout(timerId)
      timerId = null
    }
  },

  resetTimer() {
    if (!isLocked) {
      this.startTimer()
    }
  },

  unlock(password: string): boolean {
    if (password === userState.password) {
      isLocked = false
      this.startTimer()
      return true
    }
    return false
  },

  lock() {
    isLocked = true
    this.clearTimer()
  },
}
