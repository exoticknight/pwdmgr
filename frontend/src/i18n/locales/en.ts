export const en = {
  translation: {
    // Application branding
    app: {
      title: 'mat6maa5',
      slogan: 'Secure • Simple • Local',
    },

    // Common UI elements
    common: {
      loading: 'Loading...',
      back: 'Back',
      file: 'File',
      cancel: 'Cancel',
    },

    // Navigation
    navigation: {
      allItems: 'All Items',
      favorites: 'Favorites',
      recentlyUsed: 'Recently Used',
      close: 'Close',
    },

    // Buttons
    buttons: {
      newEntry: 'New Entry',
      save: 'Save',
    },

    // Accessibility labels
    accessibility: {
      close: 'Close',
    },

    // Landing page content
    landing: {
      selectFileDescription: 'Choose an existing password database file or drag & drop here',
      selectFileFormats: 'Supported: *.pwd',
      dialogTitle: 'Select Password File',
      passwordFiles: 'Password Files (*.pwd)',
      allFiles: 'All Files (*.*)',
    },

    // Search functionality
    search: {
      placeholder: 'Search title, username, notes',
      noResults: 'No matching entries found',
    },

    // Form fields and entry management
    forms: {
      // Field labels
      username: 'Username',
      password: 'Password',
      notes: 'Notes',
      title: 'Title',

      // Field placeholders
      usernamePlaceholder: 'Enter username',
      passwordPlaceholder: 'Enter password',
      notesPlaceholder: 'Optional notes...',
      titlePlaceholder: 'Enter title',

      // Entry management
      emptySubtitle: 'Select an entry to view details',
      save: 'Save',
      addEntry: 'Add Entry',
      editEntry: 'Edit Entry',

      // Time information
      createdAt: 'Created',
      updatedAt: 'Modified',
      lastUsedAt: 'Last Used',
      neverUsed: 'Never Used',
    },

    // Password dialogs
    password: {
      setTitle: 'Set Password',
      enterTitle: 'Enter Password',
      newFile: 'New Password File',
      label: 'Password',
      placeholder: 'Enter password',
      confirmLabel: 'Confirm Password',
      confirmPlaceholder: 'Confirm password',
    },

    // Action buttons
    actions: {
      // General actions
      back: 'Back',
      cancel: 'Cancel',
      create: 'Create',
      open: 'Open',
      save: 'Save',
      add: 'Add',
      update: 'Update',
      or: 'or',

      // Password specific actions
      copy: 'Copy',
      showPassword: 'Show password',
      hidePassword: 'Hide password',

      // Favorite actions
      addToFavorites: 'Add to favorites',
      removeFromFavorites: 'Remove from favorites',

      // File actions
      createNew: 'Create New Password File',
    },

    // Dialog content
    dialogs: {
      savePasswordFile: 'Save Password File',
      saveLocation: 'Choose save location for your password file',
      confirmDelete: 'Are you sure you want to delete this entry?',
      cancel: 'Cancel',
      ok: 'OK',
    },

    // Error messages
    errors: {
      passwordRequired: 'Please enter password',
      passwordMismatch: 'Passwords do not match',
      databaseError: 'Database error occurred',
      updateError: 'Failed to update entry',
      deleteError: 'Failed to delete entry',
      saveError: 'Failed to save changes',
      unsavedChanges: 'You have unsaved changes. Are you sure you want to leave?',
      noPasswordAvailable: 'No password available',
    },

    // System messages
    messages: {
      loadDatabaseFileFailed: 'Failed to load database file',
    },

    // Toast notifications
    notifications: {
      copied: 'Copied to clipboard',
      copyFailed: 'Failed to copy to clipboard',
      saved: 'Changes saved successfully',
      entryAdded: 'Entry added successfully',
      entryUpdated: 'Entry updated successfully',
      entryDeleted: 'Entry deleted successfully',
    },

    // Password generator
    passwordGenerator: {
      title: 'Password Generator',
      regenerate: 'Regenerate',
      length: 'Length',
      includeUppercase: 'Include Uppercase (A-Z)',
      includeLowercase: 'Include Lowercase (a-z)',
      includeNumbers: 'Include Numbers (0-9)',
      includeSymbols: 'Include Symbols (!@#$%^&*)',
      excludeSimilar: 'Exclude Similar Characters (il1Lo0O)',
      excludeAmbiguous: 'Exclude Ambiguous Characters ({}[]()/\\\'"`~,;.<>)',
      usePassword: 'Use Password',
      noCharsetSelected: 'No character set selected',
      feedback: {
        lengthTooShort: 'Password should be at least 8 characters long',
        addLowercase: 'Add lowercase letters',
        addUppercase: 'Add uppercase letters',
        addNumbers: 'Add numbers',
        addSymbols: 'Add special characters',
        avoidRepeating: 'Avoid consecutive repeated characters',
        avoidCommonSequences: 'Avoid common sequences',
      },
      strength: {
        weak: 'Weak',
        fair: 'Fair',
        good: 'Good',
        strong: 'Strong',
      },
    },
  },
}
