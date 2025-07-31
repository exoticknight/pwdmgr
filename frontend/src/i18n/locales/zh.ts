export const zh = {
  translation: {
    // Application branding
    app: {
      title: 'mat6maa5',
      slogan: '安全 • 简单 • 本地',
    },

    // Common UI elements
    common: {
      loading: '加载中...',
      back: '返回',
      file: '文件',
    },

    // Navigation
    navigation: {
      allItems: '所有条目',
      favorites: '收藏',
      recentlyUsed: '最近使用',
      settings: '设置',
      close: '关闭',
    },

    // Buttons
    buttons: {
      newEntry: '新建条目',
      save: '保存',
      export: '导出',
    },

    // Accessibility labels
    accessibility: {
      close: '关闭',
    },

    // Landing page content
    landing: {
      selectFileDescription: '选择现有的密码数据库文件或拖放到这里',
      selectFileFormats: '支持格式: *.pwd',
      dialogTitle: '选择密码文件',
      passwordFiles: '密码文件 (*.pwd)',
      allFiles: '所有文件 (*.*)',
    },

    // Search functionality
    search: {
      placeholder: '搜索标题，用户名，备注',
      noResults: '没有找到匹配的条目',
    },

    // Form fields and entry management
    forms: {
      // Field labels
      username: '用户名',
      password: '密码',
      notes: '备注',
      title: '标题',

      // Field placeholders
      usernamePlaceholder: '请输入用户名',
      passwordPlaceholder: '请输入密码',
      notesPlaceholder: '可选备注...',
      titlePlaceholder: '请输入标题',

      // Entry management
      emptySubtitle: '选择一个条目来查看详细信息',
      save: '保存',
      addEntry: '添加条目',

      // Time information
      createdAt: '创建时间',
      updatedAt: '修改时间',
      lastUsedAt: '最近使用',
      neverUsed: '未使用',
    },

    // Password dialog
    password: {
      setTitle: '设置密码',
      enterTitle: '输入密码',
      newFile: '新密码文件',
      label: '密码',
      placeholder: '请输入密码',
      confirmLabel: '确认密码',
      confirmPlaceholder: '请确认密码',
    },

    // Action buttons
    actions: {
      // General actions
      back: '返回',
      cancel: '取消',
      create: '创建',
      open: '打开',
      save: '保存',
      add: '添加',
      update: '更新',
      or: '或者',

      // Password specific actions
      copy: '复制',
      showPassword: '显示密码',
      hidePassword: '隐藏密码',

      // Favorite actions
      addToFavorites: '添加到收藏',
      removeFromFavorites: '从收藏中移除',

      // Entry actions
      delete: '删除',
      share: '分享',

      // File actions
      createNew: '创建新的密码文件',
    },

    // 对话框内容
    dialogs: {
      savePasswordFile: '保存密码文件',
      saveLocation: '选择密码文件的保存位置',
      confirmDelete: '您确定要删除此条目吗？',
      confirmShare: '此操作将复制明文数据到剪贴板，请注意信息安全。确定要继续吗？',
      export: '导出数据',
      exportFormat: '导出格式',
      exportLocation: '保存位置',
      exportJsonDesc: '结构化数据格式，包含完整信息',
      exportCsvDesc: '表格格式，可在Excel中打开',
      selectSaveLocation: '点击选择保存位置',
      saveAsFormat: '将保存为 {{format}} 格式',
      csvFiles: 'CSV 文件 (*.csv)',
      jsonFiles: 'JSON 文件 (*.json)',
      allFiles: '所有文件 (*.*)',
      cancel: '取消',
      ok: '确定',
    },

    // 错误消息
    errors: {
      passwordRequired: '请输入密码',
      passwordMismatch: '密码确认不匹配',
      databaseError: '数据库错误',
      updateError: '更新条目失败',
      deleteError: '删除条目失败',
      saveError: '保存更改失败',
      unsavedChanges: '您有未保存的更改。您确定要离开而不保存吗？',
      noPasswordAvailable: '没有可用密码',
      exportError: '导出数据失败',
    },

    // 系统消息
    messages: {
      loadDatabaseFileFailed: '加载数据库文件失败',
    },

    // 提示通知
    notifications: {
      copied: '已复制到剪贴板',
      copyFailed: '复制到剪贴板失败',
      shareSuccess: '数据已成功复制到剪贴板',
      shareFailed: '分享失败',
      saved: '更改已成功保存',
      entryAdded: '条目已成功添加',
      entryUpdated: '条目已成功更新',
      entryDeleted: '条目已成功删除',
      exportSuccess: '数据导出成功',
    },

    // 密码生成器
    passwordGenerator: {
      title: '密码生成器',
      regenerate: '重新生成',
      length: '长度',
      includeUppercase: '包含大写字母 (A-Z)',
      includeLowercase: '包含小写字母 (a-z)',
      includeNumbers: '包含数字 (0-9)',
      includeSymbols: '包含符号 (!@#$%^&*)',
      excludeSimilar: '排除相似字符 (il1Lo0O)',
      excludeAmbiguous: '排除模糊字符 ({}[]()/\\\'"`~,;.<>)',
      usePassword: '使用密码',
      strength: {
        weak: '弱',
        fair: '一般',
        good: '良好',
        strong: '强',
      },
    },

    // 设置页面
    setting: {
      title: '设置',

      // 安全设置
      security: {
        title: '安全设置',
        autoLock: '自动锁定',
        autoLockDescription: '在指定时间后自动锁定应用程序',
        autoLockTime: '自动锁定时间',
        autoLockTimeDescription: '设置自动锁定的时间间隔',
      },

      // 界面设置
      interface: {
        title: '界面设置',
        language: '语言',
        languageDescription: '更改应用程序的显示语言',
        theme: '主题',
        themeDescription: '选择应用程序的外观主题',
        themeAuto: '跟随系统',
        themeLight: '浅色',
        themeDark: '深色',
      },

      // 时间单位
      time: {
        minutes: '分钟',
        hour: '小时',
      },

      // 关于
      about: {
        title: '关于',
        version: '版本',
      },

      // 保存提示
      saveRequired: {
        title: '请先保存数据库',
        description: '设置信息会保存在数据库文件中。请先创建或打开一个数据库文件，并至少保存一次后才能修改设置。',
      },
    },
  },
}
