export function compareISO8601String(a: string, b: string): number {
  if (a < b)
    return -1
  if (a > b)
    return 1
  return 0
}
