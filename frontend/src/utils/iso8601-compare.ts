export function compareISO8601String(a: string | null, b: string | null): number {
  if (a === null && b === null)
    return 0
  if (a === null)
    return -1
  if (b === null)
    return 1
  if (a < b)
    return -1
  if (a > b)
    return 1
  return 0
}
