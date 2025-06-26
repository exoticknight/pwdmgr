import i18next from 'i18next'

const resources = {
  en: {
    translation: {
      app: {
        title: 'Password Manager',
        subtitle: 'Select or create your password file',
      },
      common: {
        file: 'File',
      },
      dropzone: {
        title: 'Drop password file here',
        subtitle: 'Supports .pwd files',
        selectButton: 'Select File',
      },
      actions: {
        createNew: 'Create New Password File',
        or: 'or',
        back: 'Back',
        open: 'Open',
        create: 'Create',
      },
      password: {
        label: 'Password',
        placeholder: 'Enter password',
        confirmLabel: 'Confirm Password',
        confirmPlaceholder: 'Enter password again',
        setTitle: 'Set Password for Password File',
        enterTitle: 'Enter Password for Password File',
        newFile: 'New password file',
      },
      errors: {
        invalidFile: 'Please select a valid password file (.pwd)',
        passwordRequired: 'Please enter password',
        passwordMismatch: 'Passwords do not match',
      },
    },
  },
  zh: {
    translation: {
      app: {
        title: '密码管理器',
        subtitle: '选择或创建您的密码文件',
      },
      common: {
        file: '文件',
      },
      dropzone: {
        title: '拖放密码文件到这里',
        subtitle: '支持 .pwd 格式',
        selectButton: '选择文件',
      },
      actions: {
        createNew: '创建新的密码文件',
        or: '或者',
        back: '返回',
        open: '打开',
        create: '创建',
      },
      password: {
        label: '密码',
        placeholder: '请输入密码',
        confirmLabel: '确认密码',
        confirmPlaceholder: '请再次输入密码',
        setTitle: '设置密码文件密码',
        enterTitle: '输入密码文件密码',
        newFile: '新密码文件',
      },
      errors: {
        invalidFile: '请选择一个有效的密码文件 (.pwd)',
        passwordRequired: '请输入密码',
        passwordMismatch: '密码确认不匹配',
      },
    },
  },
  ja: {
    translation: {
      app: {
        title: 'パスワードマネージャー',
        subtitle: 'パスワードファイルを選択または作成',
      },
      common: {
        file: 'ファイル',
      },
      dropzone: {
        title: 'パスワードファイルをここにドロップ',
        subtitle: '.pwd ファイルをサポート',
        selectButton: 'ファイルを選択',
      },
      actions: {
        createNew: '新しいパスワードファイルを作成',
        or: 'または',
        back: '戻る',
        open: '開く',
        create: '作成',
      },
      password: {
        label: 'パスワード',
        placeholder: 'パスワードを入力',
        confirmLabel: 'パスワード確認',
        confirmPlaceholder: 'パスワードを再入力',
        setTitle: 'パスワードファイルのパスワード設定',
        enterTitle: 'パスワードファイルのパスワード入力',
        newFile: '新しいパスワードファイル',
      },
      errors: {
        invalidFile: '有効なパスワードファイル（.pwd）を選択してください',
        passwordRequired: 'パスワードを入力してください',
        passwordMismatch: 'パスワードが一致しません',
      },
    },
  },
}

void i18next.init({
  lng: 'zh', // default language
  fallbackLng: 'en',
  resources,
  interpolation: {
    escapeValue: false, // not needed for svelte as it escapes by default
  },
})

export default i18next
