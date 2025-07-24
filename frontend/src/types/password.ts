export interface PasswordEntry {
  id: string
  title: string
  username: string
  password: string
  notes?: string
  url?: string
  icon?: string
  category?: string
  tags?: string[]
  isFavorite?: boolean
  createdAt?: string
  updatedAt?: string
  lastUsed?: string
}

export interface PasswordCategory {
  id: string
  name: string
  icon?: string
  color?: string
}

export interface PasswordStats {
  totalEntries: number
  weakPasswords: number
  duplicatePasswords: number
  recentlyUsed: PasswordEntry[]
}
