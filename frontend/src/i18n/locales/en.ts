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
    },

    // Navigation
    navigation: {
      allItems: 'All Items',
      favorites: 'Favorites',
      recentlyUsed: 'Recently Used',
      securityAudit: 'Security Audit',
      settings: 'Settings',
      close: 'Close',
    },

    // Buttons
    buttons: {
      newEntry: 'New Entry',
      save: 'Save',
      export: 'Export',
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

      // Entry actions
      delete: 'Delete',
      share: 'Share',

      // File actions
      createNew: 'Create New Password File',
    },

    // Dialog content
    dialogs: {
      savePasswordFile: 'Save Password File',
      saveLocation: 'Choose save location for your password file',
      confirmDelete: 'Are you sure you want to delete this entry?',
      confirmShare: 'This action will copy plain text data to clipboard. Please be aware of information security. Do you want to continue?',
      export: 'Export Data',
      exportFormat: 'Export Format',
      exportLocation: 'Save Location',
      exportJsonDesc: 'Structured data format with complete information',
      exportCsvDesc: 'Table format that can be opened in Excel',
      selectSaveLocation: 'Click to select save location',
      saveAsFormat: 'Will be saved as {{format}} format',
      csvFiles: 'CSV Files (*.csv)',
      jsonFiles: 'JSON Files (*.json)',
      allFiles: 'All Files (*.*)',
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
      exportError: 'Failed to export data',
    },

    // System messages
    messages: {
      loadDatabaseFileFailed: 'Failed to load database file',
    },

    // Toast notifications
    notifications: {
      copied: 'Copied to clipboard',
      copyFailed: 'Failed to copy to clipboard',
      shareSuccess: 'Data copied to clipboard successfully',
      shareFailed: 'Failed to share',
      saved: 'Changes saved successfully',
      entryAdded: 'Entry added successfully',
      entryUpdated: 'Entry updated successfully',
      entryDeleted: 'Entry deleted successfully',
      exportSuccess: 'Data exported successfully',
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
      strength: {
        weak: 'Weak',
        fair: 'Fair',
        good: 'Good',
        strong: 'Strong',
      },
    },

    // Settings page
    setting: {
      title: 'Settings',

      // Security settings
      security: {
        title: 'Security Settings',
        autoLock: 'Auto Lock',
        autoLockDescription: 'Automatically lock the application after specified time',
        autoLockTime: 'Auto Lock Time',
        autoLockTimeDescription: 'Set the time interval for auto lock',
        changePassword: 'Change Password',
        changePasswordDescription: 'Change the master password used to access this password database',
      },

      // Interface settings
      interface: {
        title: 'Interface Settings',
        language: 'Language',
        languageDescription: 'Change the display language of the application',
        theme: 'Theme',
        themeDescription: 'Choose the appearance theme of the application',
        themeAuto: 'Follow System',
        themeLight: 'Light',
        themeDark: 'Dark',
      },

      // Time units
      time: {
        minutes: 'minutes',
        hour: 'hour',
      },

      // About
      about: {
        title: 'About',
        version: 'Version',
      },

      // Save required
      saveRequired: {
        title: 'Please Save Database First',
        description: 'Settings are stored in the database file. Please create or open a database file and save it at least once before modifying settings.',
      },

      // Unsaved changes alert
      unsavedAlert: {
        message: 'You have unsaved changes',
        saveButton: 'Save Changes',
      },
    },

    // Auto lock functionality
    autoLock: {
      unlockTitle: 'Application Locked',
      unlockMessage: 'Please enter your password to unlock the application.',
      unlock: 'Unlock',
      incorrectPassword: 'Incorrect password. Please try again.',
    },

    // Change password functionality
    changePassword: {
      title: 'Change Password',
      oldPassword: 'Old Password',
      oldPasswordPlaceholder: 'Please enter current password',
      newPassword: 'New Password',
      newPasswordPlaceholder: 'Please enter new password',
      confirmPassword: 'Confirm New Password',
      confirmPasswordPlaceholder: 'Please enter new password again',
      oldPasswordIncorrect: 'Old password is incorrect',
    },
  },
}
