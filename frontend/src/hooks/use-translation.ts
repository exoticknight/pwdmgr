import i18next from '../i18n'

// 简化的翻译函数，支持Svelte响应式
export function useTranslation() {
  return {
    t: (key: string, options?: Record<string, any>) => i18next.t(key, options),
    language: () => i18next.language,
    changeLanguage: (lang: string) => {
      void i18next.changeLanguage(lang)
    },
  }
}

// 便捷的翻译函数
export const t = (key: string, options?: Record<string, any>) => i18next.t(key, options)
