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
      landing: {
        description: 'Select an existing password file or create a new password file',
      },
      database: {
        label: 'Password File',
      },
      table: {
        title: 'Title',
        username: 'Username',
        password: 'Password',
        url: 'URL',
        actions: 'Actions',
        empty: 'No password entries found',
        helpText: 'Click "Add New Entry" to start managing your passwords',
      },
      search: {
        placeholder: 'Search passwords...',
        noResults: 'No matching entries found',
      },
      dropzone: {
        title: 'Drop password file here',
        subtitle: 'Supports .pwd files',
        selectButton: 'Select File',
      },
      actions: {
        addNew: 'Add New Entry',
        copy: 'Copy',
        edit: 'Edit',
        delete: 'Delete',
        show: 'Show',
        hide: 'Hide',
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
      warnings: {
        unsavedChanges: 'You have unsaved changes. Are you sure you want to leave without saving?',
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
      landing: {
        description: '选择现有的密码文件或创建新的密码文件',
      },
      database: {
        label: '密码文件',
      },
      table: {
        title: '标题',
        username: '用户名',
        password: '密码',
        url: '网址',
        actions: '操作',
        empty: '没有找到密码条目',
        helpText: '点击"添加新条目"开始管理您的密码',
      },
      search: {
        placeholder: '搜索密码...',
        noResults: '没有找到匹配的条目',
      },
      dropzone: {
        title: '拖放密码文件到这里',
        subtitle: '支持 .pwd 格式',
        selectButton: '选择文件',
      },
      actions: {
        addNew: '添加新条目',
        copy: '复制',
        edit: '编辑',
        delete: '删除',
        show: '显示',
        hide: '隐藏',
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
        setTitle: '为密码文件设置密码',
        enterTitle: '输入密码文件的密码',
        newFile: '新密码文件',
      },
      errors: {
        invalidFile: '请选择一个有效的密码文件 (.pwd)',
        passwordRequired: '请输入密码',
        passwordMismatch: '密码确认不匹配',
      },
      warnings: {
        unsavedChanges: '您有未保存的更改。您确定要离开而不保存吗？',
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
      landing: {
        description: '既存のパスワードファイルを選択するか、新しいパスワードファイルを作成',
      },
      database: {
        label: 'パスワードファイル',
      },
      table: {
        title: 'タイトル',
        username: 'ユーザー名',
        password: 'パスワード',
        url: 'URL',
        actions: '操作',
        empty: 'パスワードエントリが見つかりません',
        helpText: '「新しいエントリを追加」をクリックしてパスワード管理を開始',
      },
      search: {
        placeholder: 'パスワードを検索...',
        noResults: '一致するエントリが見つかりません',
      },
      dropzone: {
        title: 'パスワードファイルをここにドロップ',
        subtitle: '.pwd ファイルをサポート',
        selectButton: 'ファイルを選択',
      },
      actions: {
        addNew: '新しいエントリを追加',
        copy: 'コピー',
        edit: '編集',
        delete: '削除',
        show: '表示',
        hide: '非表示',
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
        setTitle: 'パスワードファイルのパスワードを設定',
        enterTitle: 'パスワードファイルのパスワードを入力',
        newFile: '新しいパスワードファイル',
      },
      errors: {
        invalidFile: '有効なパスワードファイル（.pwd）を選択してください',
        passwordRequired: 'パスワードを入力してください',
        passwordMismatch: 'パスワードが一致しません',
      },
      warnings: {
        unsavedChanges: '保存されていない変更があります。保存せずに終了してもよろしいですか？',
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
