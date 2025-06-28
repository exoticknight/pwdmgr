export interface PasswordEntry {
  id: string
  title: string
  username: string
  password: string
  notes?: string
}

export interface SearchConfig {
  keys: Array<{ name: keyof PasswordEntry, weight: number }>
  threshold: number
  includeScore: boolean
  ignoreLocation: boolean
  shouldSort: boolean
}
