export const en = {
  translation: {
    // Application branding
    app: {
      title: 'bei3mat6',
      slogan: 'Secure • Simple • Local',
    },

    // Common UI elements
    common: {
      loading: 'Loading...',
      back: 'Back',
      file: 'File',
      or: 'or',
    },

    // Navigation
    navigation: {
      allItems: 'All Items',
      favorites: 'Favorites',
      recentlyUsed: 'Recently Used',
      password: 'Password',
      text: 'Encrypted Text',
      twoFactorAuth: '2FA',
      import: 'Import',
      audit: 'Audit',
      settings: 'Settings',
      close: 'Close',
    },

    // Buttons
    buttons: {
      newEntry: 'New Entry',
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
      icon: 'Icon',
      username: 'Username',
      password: 'Password',
      notes: 'Notes',
      title: 'Title',
      content: 'Content',
      url: 'Website URL',

      // Field placeholders
      usernamePlaceholder: 'Enter username',
      passwordPlaceholder: 'Enter password',
      notesPlaceholder: 'Enter notes',
      titlePlaceholder: 'Enter title',
      contentPlaceholder: 'Enter text content to encrypt',
      urlPlaceholder: 'Enter website URL',

      // Entry management
      emptySubtitle: 'Select an entry to view details',
      save: 'Save',
      addEntry: 'Add Entry',

      // Time information
      createdAt: 'Created',
      updatedAt: 'Modified',
      lastUsedAt: 'Last Used',
      neverUsed: 'Never Used',

      // Card titles
      loginCredentials: 'Login Credentials',
      accountInformation: 'Account Information',
      encryptedContent: 'Encrypted Content',
      additionalInformation: 'Additional Information',
      technicalParameters: 'Technical Parameters',
    },

    // Entry types
    entryTypes: {
      password: 'Password',
      encryptedText: 'Text',
      twoFactorAuth: '2FA',
    },

    // Password dialogs
    password: {
      setTitle: 'Set Password',
      enterTitle: 'Enter Password',
      newFile: 'New Secret File',
      placeholder: 'Enter password',
      confirmPlaceholder: 'Confirm password',
      forgetPassword: 'Forget Password?',
    },

    // Action buttons
    actions: {
      // General actions
      ok: 'OK',
      back: 'Back',
      cancel: 'Cancel',
      create: 'Create',
      open: 'Open',
      close: 'Close',
      save: 'Save',
      add: 'Add',
      update: 'Update',
      print: 'Print',

      // Password specific actions
      copy: 'Copy',
      showPassword: 'Show password',
      hidePassword: 'Hide password',
      openUrl: 'Open in browser',

      // Favorite actions
      addToFavorites: 'Add to favorites',
      removeFromFavorites: 'Remove from favorites',

      // Entry actions
      delete: 'Delete',
      share: 'Share',

      // File actions
      createNew: 'Create New Password File',

      // recovery actions
      continueEnable: 'I understand, continue to generate recovery code',
      continueDisable: 'I understand, continue to disable',
    },

    // Dialog content
    dialogs: {
      savePasswordFile: 'Save Password File',
      saveLocation: 'Choose save location for your password file',
      confirmDelete: 'Are you sure you want to delete this entry?',
      confirmShare: 'This action will copy plain text data to clipboard. Please be aware of information security. Do you want to continue?',
    },

    // Error messages
    errors: {
      passwordIncorrect: 'Password is incorrect',
      changePasswordFailed: 'Failed to change password',
      databaseError: 'Database error occurred',
      updateError: 'Failed to update entry',
      deleteError: 'Failed to delete entry',
      saveError: 'Failed to save changes',
      unsavedChanges: 'You have unsaved changes. Are you sure you want to leave?',
      noPasswordAvailable: 'No password available',
      exportError: 'Failed to export data',
      enableRecoveryError: 'Failed to generate recovery code',
      disableRecoveryError: 'Failed to disable recovery code',
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
      featureComingSoon: 'Feature coming soon',
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

    // Import functionality
    import: {
      importType: 'Import Type',
      supportedFormat: 'Supported File Format',
      fileFormat: '{{extension}} files',
      instructions: 'Import Instructions',
      fileSelected: 'File Selected',
      readyToImport: 'Ready to import {{type}} data',
      selectDifferentFile: 'Select Different File',
      processingFile: 'Processing {{type}} file...',
      warnings: 'Import completed with {{count}} warnings',
      fileSelection: {
        selectFile: 'Select File',
        clickOrDrag: 'Click to select or drag & drop',
        dropHere: 'Drop file here',
        supportedFormats: 'Supported formats',
      },
      fileInfo: {
        name: 'File Name',
        path: 'File Path',
        type: 'Type',
      },
      types: {
        vendor: {
          title: 'Vendor Specific',
        },
        csv: {
          title: 'CSV',
        },
      },
      fileTypes: {
        bitwarden: {
          instructions: 'Please export an unencrypted JSON file from Bitwarden. Export path: Settings → Export Vault',
        },
        keepass: {
          instructions: 'Please export an XML file from KeePass. Export path: File → Export → XML',
        },
        lastpass: {
          instructions: 'Please export a CSV file from LastPass. Export path: More Options → Advanced → Export',
        },
      },
      startImport: 'Start Import',
      processing: 'Importing, please wait...',
      success: 'Successfully imported {{count}} records, with {{error}} errors',
      errors: {
        unsupportedFormat: 'Unsupported file format',
        openFailed: 'Failed to open file',
        importFailed: 'Import failed',
      },
    },

    // Settings page
    setting: {
      title: 'Settings',

      // Security settings
      security: {
        title: 'Security',
        autoLock: 'Auto Lock',
        autoLockDescription: 'Automatically lock the application after specified time',
        autoLockTime: 'Auto Lock Time',
        autoLockTimeDescription: 'Set the time interval for auto lock',
        changePassword: 'Change Password',
        changePasswordDescription: 'Change the master password used to access this password database',
        recoveryCode: 'Recovery Code',
        recoveryCodeDescription: 'Enable recovery code to reset password if forgotten',
        recoveryCodeButtonText: 'Enable',
        recoveryCodeEnabledButtonText: 'Disable',
      },

      // Data settings
      data: {
        title: 'Data',
        exportData: {
          title: 'Export Data',
          description: 'Export your password data as CSV or JSON files',
          buttonText: 'Export Data',
        },
        exportSettings: {
          title: 'Export Settings',
          description: 'Export application settings configuration',
          buttonText: 'Export Settings',
        },
      },

      // Interface settings
      interface: {
        title: 'Interface',
        language: 'Language',
        languageDescription: 'Change the display language of the application',
        theme: 'Theme',
        themeDescription: 'Choose the appearance theme of the application',
        themeAuto: 'Follow System',
        themeLight: 'Light',
        themeDark: 'Dark',
        navigation: 'Navigation',
        navigationDescription: 'Customize the order and visibility of navigation items',
        navigationResetButton: 'Reset to Default',
        navigationMoveUp: 'Move up',
        navigationMoveDown: 'Move down',
        navigationShow: 'Switch to show',
        navigationHide: 'Switch to hide',
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

    // Auto lock modal
    autoLock: {
      title: 'Application Locked',
      message: 'Please enter your password to unlock the application.',
      unlock: 'Unlock',
      incorrectPassword: 'Incorrect password. Please try again.',
    },

    // Change password modal
    changePassword: {
      title: 'Change Password',
      oldPassword: 'Current Password',
      oldPasswordPlaceholder: 'Please enter current password',
      newPassword: 'New Password',
      newPasswordPlaceholder: 'Please enter new password',
      confirmPassword: 'Confirm New Password',
      confirmPasswordPlaceholder: 'Please enter new password again',
      passwordMatch: 'Passwords match',
      passwordMismatch: 'Passwords do not match',
      passwordMatchUnknown: 'Please enter new password',
    },

    // Enable recovery modal
    enableRecovery: {
      enableTitle: 'Enable Recovery',
      disableTitle: 'Disable Recovery',
      disabled: 'Recovery is currently disabled',
      tipBeforeEnable: 'The recovery code can only be used once',
      tipAfterEnabled: 'After closing the window, you will NOT be able to obtain the recovery code again. Please save it properly',
      warnBeforeDisable: 'Disabling recovery will prevent you from using it in the future. Are you sure you want to proceed?',
    },

    // Export modal
    export: {
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
    },

    // Two-Factor Authentication
    twofa: {
      new: 'Add Two-Factor Authentication',
      selectQrCodeImage: 'Select QR Code Image',
      dropHere: 'Drop image here',
      clickToSelect: 'Click to select or drag & drop',
      instructions: 'Select a QR code image from your device',
      scanClipboard: 'Scan Image from Clipboard',
      processing: 'Processing...',
    },
  },
}
