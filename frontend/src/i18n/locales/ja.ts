export const ja = {
  translation: {
    // アプリケーションブランド
    app: {
      title: 'bei3mat6',
      slogan: 'セキュア • シンプル • ローカル',
    },

    // 共通UI要素
    common: {
      loading: '読み込み中...',
      back: '戻る',
      file: 'ファイル',
      or: 'または',
    },

    // ナビゲーション
    navigation: {
      allItems: 'すべてのアイテム',
      favorites: 'お気に入り',
      recentlyUsed: '最近使用',
      password: 'パスワード',
      text: '暗号化テキスト',
      twoFactorAuth: '二段階認証',
      import: 'インポート',
      audit: '監査',
      settings: '設定',
      close: '閉じる',
    },

    // ボタン
    buttons: {
      newEntry: '新しいエントリ',
    },

    // アクセシビリティラベル
    accessibility: {
      close: '閉じる',
    },

    // ランディングページコンテンツ
    landing: {
      selectFileDescription: '既存のパスワードデータベースファイルを選択するか、ここにドラッグ&ドロップ',
      selectFileFormats: 'サポート形式: *.pwd',
      dialogTitle: 'パスワードファイルを選択',
      passwordFiles: 'パスワードファイル (*.pwd)',
      allFiles: 'すべてのファイル (*.*)',
    },

    // 検索機能
    search: {
      placeholder: 'タイトル、ユーザー名、メモを検索',
      noResults: '一致するエントリが見つかりません',
    },

    // フォームフィールドとエントリ管理
    forms: {
      // フィールドラベル
      icon: 'アイコン',
      username: 'ユーザー名',
      password: 'パスワード',
      notes: 'メモ',
      title: 'タイトル',
      content: 'コンテンツ',
      url: 'ウェブサイトURL',

      // フィールドプレースホルダー
      usernamePlaceholder: 'ユーザー名を入力',
      passwordPlaceholder: 'パスワードを入力',
      notesPlaceholder: 'メモを入力',
      titlePlaceholder: 'タイトルを入力',
      contentPlaceholder: '暗号化するテキストを入力',
      urlPlaceholder: 'ウェブサイトURLを入力',

      // エントリ管理
      emptySubtitle: 'エントリを選択して詳細を表示',
      save: '保存',
      addEntry: 'エントリを追加',

      // 時間情報
      createdAt: '作成日時',
      updatedAt: '更新日時',
      lastUsedAt: '最終使用',
      neverUsed: '未使用',

      // カードタイトル
      loginCredentials: 'ログイン認証情報',
      accountInformation: 'アカウント情報',
      encryptedContent: '暗号化コンテンツ',
      additionalInformation: '追加情報',
      technicalParameters: '技術パラメータ',
    },

    // エントリタイプ
    entryTypes: {
      password: 'パスワード',
      encryptedText: 'テキスト',
      twoFactorAuth: '二段階認証',
    },

    // パスワードダイアログ
    password: {
      setTitle: 'パスワード設定',
      enterTitle: 'パスワード入力',
      newFile: '新しいシークレットファイル',
      placeholder: 'パスワードを入力',
      confirmPlaceholder: 'パスワードを確認',
      forgetPassword: 'パスワードを忘れた？',
    },

    // アクションボタン
    actions: {
      // 一般的なアクション
      ok: '確認',
      back: '戻る',
      cancel: 'キャンセル',
      create: '作成',
      open: '開く',
      close: '閉じる',
      save: '保存',
      add: '追加',
      update: '更新',
      print: '印刷',

      // パスワード固有のアクション
      copy: 'コピー',
      showPassword: 'パスワードを表示',
      hidePassword: 'パスワードを非表示',
      openUrl: 'ブラウザで開く',

      // お気に入りアクション
      addToFavorites: 'お気に入りに追加',
      removeFromFavorites: 'お気に入りから削除',

      // エントリアクション
      delete: '削除',
      share: '共有',

      // ファイルアクション
      createNew: '新しいパスワードファイルを作成',

      // recovery actions
      continueEnable: '私は理解しています、リカバリーコードの生成を続行します',
      continueDisable: '私は理解しています、続行して無効にします',
    },

    // ダイアログコンテンツ
    dialogs: {
      savePasswordFile: 'パスワードファイルを保存',
      saveLocation: 'パスワードファイルの保存場所を選択',
      confirmDelete: 'このエントリを削除してもよろしいですか？',
      confirmShare: 'この操作は平文データをクリップボードにコピーします。情報セキュリティにご注意ください。続行しますか？',
    },

    // エラーメッセージ
    errors: {
      passwordIncorrect: 'パスワードが正しくありません',
      changePasswordFailed: 'パスワードの変更に失敗しました',
      databaseError: 'データベースエラー',
      updateError: 'エントリの更新に失敗しました',
      deleteError: 'エントリの削除に失敗しました',
      saveError: '変更の保存に失敗しました',
      unsavedChanges: '保存されていない変更があります。保存せずに終了してもよろしいですか？',
      noPasswordAvailable: '利用可能なパスワードがありません',
      exportError: 'データのエクスポートに失敗しました',
      enableRecoveryError: 'リカバリーコードの生成に失敗しました',
      disableRecoveryError: 'リカバリーコードの無効化に失敗しました',
    },

    // システムメッセージ
    messages: {
      loadDatabaseFileFailed: 'データベースファイルの読み込みに失敗しました',
    },

    // トースト通知
    notifications: {
      copied: 'クリップボードにコピーしました',
      copyFailed: 'クリップボードへのコピーに失敗しました',
      shareSuccess: 'データが正常にクリップボードにコピーされました',
      shareFailed: '共有に失敗しました',
      saved: '変更が正常に保存されました',
      entryAdded: 'エントリが正常に追加されました',
      entryUpdated: 'エントリが正常に更新されました',
      entryDeleted: 'エントリが正常に削除されました',
      exportSuccess: 'データが正常にエクスポートされました',
      featureComingSoon: '機能は近日公開予定',
    },

    // パスワード生成器
    passwordGenerator: {
      title: 'パスワード生成器',
      regenerate: '再生成',
      length: '長さ',
      includeUppercase: '大文字を含む (A-Z)',
      includeLowercase: '小文字を含む (a-z)',
      includeNumbers: '数字を含む (0-9)',
      includeSymbols: '記号を含む (!@#$%^&*)',
      excludeSimilar: '類似文字を除く (il1Lo0O)',
      excludeAmbiguous: '曖昧な文字を除く ({}[]()/\\\'"`~,;.<>)',
      usePassword: 'パスワードを使用',
      strength: {
        weak: '弱い',
        fair: '普通',
        good: '良い',
        strong: '強い',
      },
    },

    // インポート機能
    import: {
      importType: 'インポートタイプ',
      supportedFormat: 'サポートファイル形式',
      fileFormat: '{{extension}} ファイル',
      instructions: 'インポート手順',
      fileSelected: 'ファイル選択済み',
      readyToImport: '{{type}} データのインポート準備完了',
      selectDifferentFile: '別のファイルを選択',
      processingFile: '{{type}} ファイルを処理中...',
      warnings: 'インポート完了、{{count}}件の警告があります',
      fileSelection: {
        selectFile: 'ファイル選択',
        clickOrDrag: 'クリックして選択またはドラッグ&ドロップ',
        dropHere: 'ファイルをここにドロップ',
        supportedFormats: 'サポート形式',
      },
      fileInfo: {
        name: 'ファイル名',
        path: 'ファイルパス',
        type: 'タイプ',
      },
      types: {
        vendor: {
          title: 'ベンダー固有',
        },
        csv: {
          title: 'CSV',
        },
      },
      fileTypes: {
        bitwarden: {
          instructions: 'Bitwarden から暗号化されていないJSONファイルをエクスポートしてください。エクスポート手順: 設定 → 保管庫のエクスポート',
        },
        keepass: {
          instructions: 'KeePass から CSVファイルをエクスポートしてください。エクスポート手順: ファイル → エクスポート → CSV',
        },
        lastpass: {
          instructions: 'LastPass から CSVファイルをエクスポートしてください。エクスポート手順: その他のオプション → 詳細 → エクスポート',
        },
      },
      startImport: 'インポート開始',
      processing: 'インポート中、お待ちください...',
      success: '{{count}}件のレコードを正常にインポートしました、{{error}}個のエラー',
      errors: {
        unsupportedFormat: 'サポートされていないファイル形式',
        openFailed: 'ファイルのオープンに失敗しました',
        importFailed: 'インポートに失敗しました',
      },
    },

    // 設定ページ
    setting: {
      title: '設定',

      // セキュリティ設定
      security: {
        title: 'セキュリティ',
        autoLock: '自動ロック',
        autoLockDescription: '指定時間後にアプリケーションを自動ロック',
        autoLockTime: '自動ロック時間',
        autoLockTimeDescription: '自動ロックする時間間隔を設定',
        changePassword: 'パスワード変更',
        changePasswordDescription: 'このパスワードデータベースにアクセスするためのマスターパスワードを変更',
        recoveryCode: 'リカバリーコード',
        recoveryCodeDescription: 'パスワードを忘れた場合にリカバリーコードを使用してパスワードをリセットできます',
        recoveryCodeButtonText: '有効にする',
        recoveryCodeEnabledButtonText: '無効にする',
      },

      // データ設定
      data: {
        title: 'データ',
        exportData: {
          title: 'データエクスポート',
          description: 'パスワードデータをCSVまたはJSONファイルとしてエクスポート',
          buttonText: 'データをエクスポート',
        },
        exportSettings: {
          title: '設定エクスポート',
          description: 'アプリケーション設定をエクスポート',
          buttonText: '設定をエクスポート',
        },
      },

      // インターフェース設定
      interface: {
        title: 'インターフェース',
        language: '言語',
        languageDescription: 'アプリケーションの表示言語を変更',
        theme: 'テーマ',
        themeDescription: 'アプリケーションの外観テーマを選択',
        themeAuto: 'システムに従う',
        themeLight: 'ライト',
        themeDark: 'ダーク',
        navigation: 'ナビゲーション',
        navigationDescription: 'ナビゲーション項目の順序と表示設定をカスタマイズ',
        navigationResetButton: 'デフォルトに戻す',
        navigationMoveUp: '上に移動',
        navigationMoveDown: '下に移動',
        navigationShow: '表示に切り替え',
        navigationHide: '非表示に切り替え',
      },

      // 時間単位
      time: {
        minutes: '分',
        hour: '時間',
      },

      // アプリについて
      about: {
        title: 'アプリについて',
        version: 'バージョン',
      },

      // 保存が必要
      saveRequired: {
        title: 'データベースを先に保存してください',
        description: '設定情報はデータベースファイルに保存されます。設定を変更する前に、データベースファイルを作成または開いて、少なくとも一度保存してください。',
      },

      // 未保存の変更アラート
      unsavedAlert: {
        message: '未保存の変更があります',
        saveButton: '変更を保存',
      },
    },

    // 自動ロック機能
    autoLock: {
      title: 'アプリケーションがロックされています',
      message: 'アプリケーションのロックを解除するには、パスワードを入力してください。',
      unlock: 'ロック解除',
      incorrectPassword: 'パスワードが間違っています。再試行してください。',
    },

    // パスワード変更機能
    changePassword: {
      title: 'パスワード変更',
      oldPassword: '現在のパスワード',
      oldPasswordPlaceholder: '現在のパスワードを入力してください',
      newPassword: '新しいパスワード',
      newPasswordPlaceholder: '新しいパスワードを入力してください',
      confirmPassword: '新しいパスワード（確認）',
      confirmPasswordPlaceholder: '新しいパスワードを再度入力してください',
      passwordMatch: 'パスワードが一致します',
      passwordMismatch: 'パスワードが一致しません',
      passwordMatchUnknown: '新しいパスワードを入力してください',
    },

    // リカバリーを有効にする
    enableRecovery: {
      enableTitle: 'リカバリーを有効にする',
      disableTitle: 'リカバリーを無効にする',
      disabled: 'リカバリーは現在無効です',
      tipBeforeEnable: 'リカバリーコードは一度だけ使用できます',
      tipAfterEnabled: 'ウィンドウを閉じると、リカバリーコードを再取得することはできません。必ず保存してください',
      warnBeforeDisable: 'リカバリーを無効にすると、将来的に使用できなくなります。本当に続行しますか？',
    },

    // Export modal
    export: {
      export: 'データをエクスポート',
      exportFormat: 'エクスポート形式',
      exportLocation: '保存場所',
      exportJsonDesc: '構造化データ形式、完全な情報を含む',
      exportCsvDesc: 'テーブル形式、Excelで開けます',
      selectSaveLocation: 'クリックして保存場所を選択',
      saveAsFormat: '{{format}}形式で保存されます',
      csvFiles: 'CSVファイル (*.csv)',
      jsonFiles: 'JSONファイル (*.json)',
      allFiles: 'すべてのファイル (*.*)',
    },

    // 2fa
    twofa: {
      new: '二要素認証を追加',
      selectQrCodeImage: 'QRコード画像を選択',
      dropHere: 'ここに画像をドロップ',
      clickToSelect: 'クリックして選択またはドラッグ＆ドロップ',
      instructions: 'デバイスからQRコード画像を選択してください',
      scanClipboard: 'クリップボードから画像をスキャン',
      processing: '処理中...',
    },
  },
}
