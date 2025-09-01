export function equals(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) {
    return false
  }

  return a.every((value, index) => value === b[index])
}
