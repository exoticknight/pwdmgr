/**
 * Creates a throttled function that only invokes the provided function at most once per `wait` milliseconds.
 * @param func The function to throttle
 * @param wait The number of milliseconds to throttle invocations to
 * @returns The throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let lastCallTime = 0
  let timeoutId: ReturnType<typeof setTimeout> | undefined

  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now()
    const timeSinceLastCall = now - lastCallTime

    const executeFunction = () => {
      lastCallTime = Date.now()
      func.apply(this, args)
    }

    if (timeSinceLastCall >= wait) {
      // If enough time has passed, execute immediately
      executeFunction()
    }
    else {
      // Clear any existing timeout
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId)
      }

      // Set a timeout to execute the function after the remaining wait time
      timeoutId = setTimeout(executeFunction, wait - timeSinceLastCall)
    }
  }
}
