export const ja = {
  translation: {
    // アプリケーションブランド
    app: {
      title: 'mat6maa5',
      slogan: 'セキュア • シンプル • ローカル',
    },

    // 共通UI要素
    common: {
      loading: '読み込み中...',
      back: '戻る',
      file: 'ファイル',
      cancel: 'キャンセル',
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
      username: 'ユーザー名',
      password: 'パスワード',
      notes: 'メモ',
      title: 'タイトル',

      // フィールドプレースホルダー
      usernamePlaceholder: 'ユーザー名を入力',
      passwordPlaceholder: 'パスワードを入力',
      notesPlaceholder: 'オプションのメモ...',
      titlePlaceholder: 'タイトルを入力',

      // エントリ管理
      emptySubtitle: 'エントリを選択して詳細を表示',
      confirmDelete: 'このエントリを削除してもよろしいですか？',
      save: '保存',
      addEntry: 'エントリを追加',
      editEntry: 'エントリを編集',

      // 時間情報
      createdAt: '作成日時',
      updatedAt: '更新日時',
      lastUsedAt: '最終使用',
      neverUsed: '未使用',
    },

    // パスワードダイアログ
    password: {
      setTitle: 'パスワード設定',
      enterTitle: 'パスワード入力',
      newFile: '新しいパスワードファイル',
      label: 'パスワード',
      placeholder: 'パスワードを入力',
      confirmLabel: 'パスワード確認',
      confirmPlaceholder: 'パスワードを確認',
    },

    // アクションボタン
    actions: {
      // 一般的なアクション
      back: '戻る',
      cancel: 'キャンセル',
      create: '作成',
      open: '開く',
      save: '保存',
      add: '追加',
      update: '更新',
      or: 'または',

      // パスワード固有のアクション
      copy: 'コピー',
      showPassword: 'パスワードを表示',
      hidePassword: 'パスワードを非表示',

      // お気に入りアクション
      addToFavorites: 'お気に入りに追加',
      removeFromFavorites: 'お気に入りから削除',

      // ファイルアクション
      createNew: '新しいパスワードファイルを作成',
    },

    // ダイアログコンテンツ
    dialogs: {
      savePasswordFile: 'パスワードファイルを保存',
      saveLocation: 'パスワードファイルの保存場所を選択',
      cancel: 'キャンセル',
    },

    // エラーメッセージ
    errors: {
      passwordRequired: 'パスワードを入力してください',
      passwordMismatch: 'パスワードが一致しません',
      databaseError: 'データベースエラー',
      updateError: 'エントリの更新に失敗しました',
      deleteError: 'エントリの削除に失敗しました',
      saveError: '変更の保存に失敗しました',
      unsavedChanges: '保存されていない変更があります。保存せずに終了してもよろしいですか？',
      noPasswordAvailable: '利用可能なパスワードがありません',
    },

    // システムメッセージ
    messages: {
      loadDatabaseFileFailed: 'データベースファイルの読み込みに失敗しました',
    },

    // トースト通知
    notifications: {
      copied: 'クリップボードにコピーしました',
      copyFailed: 'クリップボードへのコピーに失敗しました',
      saved: '変更が正常に保存されました',
      entryAdded: 'エントリが正常に追加されました',
      entryUpdated: 'エントリが正常に更新されました',
      entryDeleted: 'エントリが正常に削除されました',
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
  },
}
