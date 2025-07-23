export const zh = {
  translation: {
    // 应用程序品牌
    app: {
      title: 'mat6maa5',
      slogan: '安全 • 简单 • 本地',
    },

    // 通用界面元素
    common: {
      loading: '加载中...',
      back: '返回',
      file: '文件',
    },

    // 导航
    navigation: {
      allItems: '所有条目',
      favorites: '收藏',
      recentlyUsed: '最近使用',
      close: '关闭',
    },

    // 按钮
    buttons: {
      newEntry: '新建条目',
      save: '保存',
      export: '导出',
    },

    // 无障碍标签
    accessibility: {
      close: '关闭',
    },

    // 登录页面内容
    landing: {
      selectFileDescription: '选择现有的密码数据库文件或拖放到这里',
      selectFileFormats: '支持格式: *.pwd',
      dialogTitle: '选择密码文件',
      passwordFiles: '密码文件 (*.pwd)',
      allFiles: '所有文件 (*.*)',
    },

    // 搜索功能
    search: {
      placeholder: '搜索标题，用户名，备注',
      noResults: '没有找到匹配的条目',
    },

    // 表单字段和条目管理
    forms: {
      // 字段标签
      username: '用户名',
      password: '密码',
      notes: '备注',
      title: '标题',

      // 字段占位符
      usernamePlaceholder: '请输入用户名',
      passwordPlaceholder: '请输入密码',
      notesPlaceholder: '可选备注...',
      titlePlaceholder: '请输入标题',

      // 条目管理
      emptySubtitle: '选择一个条目来查看详细信息',
      save: '保存',
      addEntry: '添加条目',

      // 时间信息
      createdAt: '创建时间',
      updatedAt: '修改时间',
      lastUsedAt: '最近使用',
      neverUsed: '未使用',
    },

    // 密码对话框
    password: {
      setTitle: '设置密码',
      enterTitle: '输入密码',
      newFile: '新密码文件',
      label: '密码',
      placeholder: '请输入密码',
      confirmLabel: '确认密码',
      confirmPlaceholder: '请确认密码',
    },

    // 操作按钮
    actions: {
      // 通用操作
      back: '返回',
      cancel: '取消',
      create: '创建',
      open: '打开',
      save: '保存',
      add: '添加',
      update: '更新',
      or: '或者',

      // 密码特定操作
      copy: '复制',
      showPassword: '显示密码',
      hidePassword: '隐藏密码',

      // 收藏操作
      addToFavorites: '添加到收藏',
      removeFromFavorites: '从收藏中移除',

      // 条目操作
      delete: '删除',
      share: '分享',

      // 文件操作
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
      noCharsetSelected: '未选择字符集',
      feedback: {
        lengthTooShort: '密码长度至少8位',
        addLowercase: '添加小写字母',
        addUppercase: '添加大写字母',
        addNumbers: '添加数字',
        addSymbols: '添加特殊字符',
        avoidRepeating: '避免连续相同字符',
        avoidCommonSequences: '避免常见序列',
      },
      strength: {
        weak: '弱',
        fair: '一般',
        good: '良好',
        strong: '强',
      },
    },
  },
}
