export interface FileSelection {
  file: File // Always a File object now
  fileName: string // Display name
  isValid: boolean // Whether file passes validation
  error?: string // Validation error message
}
