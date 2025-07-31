export function compareISO8601String(a?: string, b?: string): number {
  if (a === undefined && b === undefined)
    return 0
  if (a === undefined)
    return -1
  if (b === undefined)
    return 1
  if (a < b)
    return -1
  if (a > b)
    return 1
  return 0
}
