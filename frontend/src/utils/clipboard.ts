export async function copyTextToClipboard(text: string) {
  return navigator.clipboard.writeText(text)
}

export async function readTextFromClipboard() {
  return navigator.clipboard.readText()
}

export async function readFromClipboard() {
  return navigator.clipboard.read()
}
