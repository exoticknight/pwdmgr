import i18next from '../i18n'

// 密码管理器文件配置
export const PASSWORD_FILE_CONFIG = {
  // 文件扩展名
  extensions: ['.pwd'],

  // 文件类型描述
  description: '密码管理器文件',

  // accept属性值
  acceptAttribute: '.pwd',

  // 文件验证函数
  isValidFile: (filename: string): boolean => {
    return PASSWORD_FILE_CONFIG.extensions.some(ext => filename.endsWith(ext))
  },

  // 错误消息 (使用i18n)
  get errorMessage(): string {
    return i18next.t('errors.invalidFile')
  },
} as const
