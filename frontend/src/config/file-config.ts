import i18next from '../i18n'

// Password manager file configuration
export const PASSWORD_FILE_CONFIG = {
  // File extensions
  extensions: ['.pwd'],

  // File type description
  description: '密码管理器文件',

  // Accept attribute value
  acceptAttribute: '.pwd',

  // File validation function
  isValidFile: (filename: string): boolean => {
    return PASSWORD_FILE_CONFIG.extensions.some(ext => filename.endsWith(ext))
  },

  // Error message (using i18n)
  get errorMessage(): string {
    return i18next.t('errors.invalidFile')
  },
} as const
