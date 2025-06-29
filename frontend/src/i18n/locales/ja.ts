export const ja = {
  translation: {
    // アプリケーションブランド
    app: {
      title: 'パスワードマネージャー',
      slogan: 'セキュア • シンプル • ローカル',
    },

    // 共通UI要素
    common: {
      loading: '読み込み中...',
      back: '戻る',
      file: 'ファイル',
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
      placeholder: 'パスワードを検索...',
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
  },
}
