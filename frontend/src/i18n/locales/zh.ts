export const zh = {
  translation: {
    // Application branding
    app: {
      title: 'bei3mat6',
      slogan: '安全 • 简单 • 本地',
    },

    // Common UI elements
    common: {
      loading: '加载中...',
      back: '返回',
      file: '文件',
      or: '或者',
    },

    // Navigation
    navigation: {
      allItems: '所有条目',
      favorites: '收藏',
      recentlyUsed: '最近使用',
      password: '密码',
      text: '加密文本',
      twoFactorAuth: '双重认证',
      import: '导入',
      audit: '审计',
      settings: '设置',
      close: '关闭',
    },

    // Buttons
    buttons: {
      newEntry: '新建条目',
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
      icon: '图标',
      username: '用户名',
      password: '密码',
      notes: '备注',
      title: '标题',
      content: '内容',
      url: '网站网址',

      // Field placeholders
      usernamePlaceholder: '请输入用户名',
      passwordPlaceholder: '请输入密码',
      notesPlaceholder: '请输入备注',
      titlePlaceholder: '请输入标题',
      contentPlaceholder: '请输入要加密的文本内容',
      urlPlaceholder: '请输入网站网址',

      // Entry management
      emptySubtitle: '选择一个条目来查看详细信息',
      save: '保存',
      addEntry: '添加条目',

      // Time information
      createdAt: '创建时间',
      updatedAt: '修改时间',
      lastUsedAt: '最近使用',
      neverUsed: '未使用',

      // Card titles
      loginCredentials: '登录凭证',
      accountInformation: '账户信息',
      encryptedContent: '加密内容',
      additionalInformation: '附加信息',
      technicalParameters: '技术参数',
    },

    // Entry types
    entryTypes: {
      password: '密码',
      encryptedText: '文本',
      twoFactorAuth: '双重认证',
    },

    // Password dialog
    password: {
      setTitle: '设置密码',
      enterTitle: '输入密码',
      newFile: '新建秘密文件',
      placeholder: '请输入密码',
      confirmPlaceholder: '请确认密码',
      forgetPassword: '忘记密码？',
    },

    // Action buttons
    actions: {
      // General actions
      ok: '确定',
      back: '返回',
      cancel: '取消',
      create: '创建',
      open: '打开',
      close: '关闭',
      save: '保存',
      add: '添加',
      update: '更新',
      print: '打印',

      // Password specific actions
      copy: '复制',
      showPassword: '显示密码',
      hidePassword: '隐藏密码',
      openUrl: '在浏览器中打开',

      // Favorite actions
      addToFavorites: '添加到收藏',
      removeFromFavorites: '从收藏中移除',

      // Entry actions
      delete: '删除',
      share: '分享',

      // File actions
      createNew: '创建新的密码文件',

      // recovery actions
      continueEnable: '我已知晓，生成恢复码',
      continueDisable: '我已知晓，继续禁用',
    },

    // 对话框内容
    dialogs: {
      savePasswordFile: '保存密码文件',
      saveLocation: '选择密码文件的保存位置',
      confirmDelete: '您确定要删除此条目吗？',
      confirmShare: '此操作将复制明文数据到剪贴板，请注意信息安全。确定要继续吗？',
    },

    // 错误消息
    errors: {
      passwordIncorrect: '密码不正确',
      changePasswordFailed: '修改密码失败',
      databaseError: '数据库错误',
      updateError: '更新条目失败',
      deleteError: '删除条目失败',
      saveError: '保存更改失败',
      unsavedChanges: '您有未保存的更改。您确定要离开而不保存吗？',
      noPasswordAvailable: '没有可用密码',
      exportError: '导出数据失败',
      enableRecoveryError: '生成恢复码失败',
      disableRecoveryError: '禁用恢复码失败',
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
      featureComingSoon: '功能即将推出',
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

    // 导入功能
    import: {
      importType: '导入类型',
      supportedFormat: '支持的文件格式',
      fileFormat: '{{extension}} 文件',
      instructions: '导入说明',
      fileSelected: '已选择文件',
      readyToImport: '准备导入 {{type}} 数据',
      selectDifferentFile: '选择其他文件',
      processingFile: '正在处理 {{type}} 文件...',
      warnings: '导入完成，有 {{count}} 个警告',
      fileSelection: {
        selectFile: '选择文件',
        clickOrDrag: '点击选择或拖放文件',
        dropHere: '拖放文件到这里',
        supportedFormats: '支持格式',
      },
      fileInfo: {
        name: '文件名称',
        path: '文件路径',
        type: '类型',
      },
      types: {
        vendor: {
          title: '特定供应商',
        },
        csv: {
          title: 'CSV',
        },
      },
      fileTypes: {
        bitwarden: {
          instructions: '请从 Bitwarden 导出未加密的 JSON 文件。导出路径：设置 → 导出密码库',
        },
        keepass: {
          instructions: '请从 KeePass 导出 XML 文件。导出路径：文件 → 导出 → XML',
        },
        lastpass: {
          instructions: '请从 LastPass 导出 CSV 文件。导出路径：更多选项 → 高级 → 导出',
        },
      },
      startImport: '开始导入',
      processing: '导入中，请稍候...',
      success: '成功导入 {{count}} 条记录，{{error}} 个错误',
      errors: {
        unsupportedFormat: '不支持的文件格式',
        openFailed: '文件打开失败',
        importFailed: '导入失败',
      },
    },

    // 设置页面
    setting: {
      title: '设置',

      // 安全设置
      security: {
        title: '安全',
        autoLock: '自动锁定',
        autoLockDescription: '在指定时间后自动锁定应用程序',
        autoLockTime: '自动锁定时间',
        autoLockTimeDescription: '设置自动锁定的时间间隔',
        changePassword: '修改密码',
        changePasswordDescription: '更改用于访问此密码库的主密码',
        recoveryCode: '恢复代码',
        recoveryCodeDescription: '忘记密码时使用恢复代码重置密码',
        recoveryCodeButtonText: '启用',
        recoveryCodeEnabledButtonText: '禁用',
      },

      // 数据设置
      data: {
        title: '数据',
        exportData: {
          title: '导出数据',
          description: '将您的密码数据导出为 CSV 或 JSON 文件',
          buttonText: '导出数据',
        },
        exportSettings: {
          title: '导出设置',
          description: '导出应用程序的设置配置',
          buttonText: '导出设置',
        },
      },

      // 界面设置
      interface: {
        title: '界面',
        language: '语言',
        languageDescription: '更改应用程序的显示语言',
        theme: '主题',
        themeDescription: '选择应用程序的外观主题',
        themeAuto: '跟随系统',
        themeLight: '浅色',
        themeDark: '深色',
        navigation: '导航栏',
        navigationDescription: '自定义导航项的顺序和可见性',
        navigationResetButton: '重置为默认',
        navigationMoveUp: '向上移动',
        navigationMoveDown: '向下移动',
        navigationShow: '切换到显示',
        navigationHide: '切换到隐藏',
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

      // 未保存更改提醒
      unsavedAlert: {
        message: '有未保存的更改',
        saveButton: '保存更改',
      },
    },

    // 自动锁定功能
    autoLock: {
      title: '应用程序已锁定',
      message: '请输入密码以解锁应用程序。',
      unlock: '解锁',
      incorrectPassword: '密码错误，请重试。',
    },

    // 修改密码功能
    changePassword: {
      title: '修改密码',
      oldPassword: '当前密码',
      oldPasswordPlaceholder: '请输入当前密码',
      newPassword: '新密码',
      newPasswordPlaceholder: '请输入新密码',
      confirmPassword: '确认新密码',
      confirmPasswordPlaceholder: '请再次输入新密码',
      passwordMatch: '密码匹配',
      passwordMismatch: '密码不匹配',
      passwordMatchUnknown: '请输入新密码',
    },

    // 启用恢复功能
    enableRecovery: {
      enableTitle: '启用恢复码',
      disableTitle: '禁用恢复码',
      disabled: '恢复功能已禁用',
      tipBeforeEnable: '恢复码只能使用一次',
      tipAfterEnabled: '关闭窗口后将无法再次获取恢复码，请妥善保存',
      warnBeforeDisable: '禁用恢复将阻止您将来使用它。您确定要继续吗？',
    },

    // Export modal
    export: {
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
    },

    // 2fa
    twofa: {
      new: '添加双重验证',
      selectQrCodeImage: '选择QR码图像',
      dropHere: '将图像拖放到此处',
      clickToSelect: '点击选择或拖放',
      instructions: '从设备中选择一个QR码图像',
      scanClipboard: '从剪贴板扫描图像',
      processing: '处理中...',
    },
  },
}
