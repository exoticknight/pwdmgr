import type { Datum } from '@/types/data'

export type ImportEntry = Omit<Datum, '_id'>

export interface ImportResult {
  success: boolean
  count: number
  entries: ImportEntry[]
  errors?: string[]
}

export interface ImporterConfig {
  value: string
  label: string
  extension: string
  descriptionKey: string
  instructionsKey?: string
}

export interface BaseImporter {
  process: (fileContent: string) => Promise<ImportResult>
}
