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
      exit: 'Exit',
    },

    navigation: {
      allItems: 'All Items',
      favorites: 'Favorites',
      recentlyUsed: 'Recently Used',
      password: 'Password',
      text: 'Encrypted Text',
      twoFactorAuth: '2FA',
      payment: 'Payment',
      phone: 'Phone',
      import: 'Import',
      audit: 'Audit',
      settings: 'Settings',
      close: 'Close',
      lock: 'Lock Now',
      lockAfter: 'Lock after',
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
      searchToLink: 'Search items to link...',
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
      issuer: 'Issuer',
      cardholderName: 'Cardholder Name',
      cardNumber: 'Card Number',
      expiryDate: 'Expiry Date (MM/YY)',
      cvv: 'CVV/CVC',
      countryRegion: 'Country/Region',
      phoneNumber: 'Phone Number',
      carrier: 'Carrier',

      // Field placeholders
      usernamePlaceholder: 'Enter username',
      passwordPlaceholder: 'Enter password',
      notesPlaceholder: 'Enter notes',
      titlePlaceholder: 'Enter title',
      contentPlaceholder: 'Enter text content to encrypt',
      urlPlaceholder: 'Enter website URL',
      issuerPlaceholder: 'e.g., Visa, Mastercard, Bank Name',
      cardholderNamePlaceholder: 'Name on card',
      cardNumberPlaceholder: 'XXXX XXXX XXXX XXXX',
      expiryDatePlaceholder: 'MM/YY',
      cvvPlaceholder: 'XXX',
      phoneNumberPlaceholder: 'Enter phone number',
      carrierPlaceholder: 'Enter carrier name',
      phoneTitlePlaceholder: 'e.g., Personal, Work',
      selectCarrier: 'Select carrier',
      countryRegionPlaceholder: 'Search country/region',

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
      paymentInformation: 'Payment Information',
      phoneInformation: 'Phone Information',
      additionalInformation: 'Additional Information',
      technicalParameters: 'Technical Parameters',
      links: 'Links',
      noLinks: 'No associated items',
    },

    // Entry types
    entryTypes: {
      password: 'Password',
      encryptedText: 'Text',
      twoFactorAuth: '2FA',
      payment: 'Payment',
      phone: 'Phone',
    },

    // Password dialogs
    password: {
      setTitle: 'Set Password',
      enterTitle: 'Enter Password',
      newFile: 'New Secret File',
      label: 'Password',
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
      rename: 'Rename',
      share: 'Share',
      unlink: 'Unlink',

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
      renameTitle: 'Enter a new title name',
      linkItems: 'Link Items',
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
      entryRenamed: 'Entry renamed successfully',
      exportSuccess: 'Data exported successfully',
      settingsExportSuccess: 'Settings exported successfully',
      settingsImportSuccess: 'Settings imported successfully',
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
      browserType: 'Browser Type',
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
          title: 'From Vendor',
        },
        browser: {
          title: 'From Browser',
        },
        csv: {
          title: 'From CSV',
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
        settingsExportError: 'Failed to export settings',
        settingsImportError: 'Failed to import settings. Please check the file format.',
      },
      browser: {
        chrome: {
          description: 'CSV format password export file',
          instructions: 'Open chrome://password-manager/settings, click Download file button in Export passwords section',
        },
        firefox: {
          description: 'CSV format password export file',
          instructions: 'Open about:logins in Firefox, click the ⋯ menu, and select "Export Logins" to download the CSV file',
        },
        edge: {
          description: 'CSV format password export file',
          instructions: 'Open edge://wallet/passwords, click "Export passwords" button and download the CSV file',
        },
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
        twoFactorAuth: 'Two-Factor Authentication',
        twoFactorAuthDescription: 'Require a TOTP code from your authenticator app when unlocking',
        twoFactorAuthEnableButton: 'Enable',
        twoFactorAuthDisableButton: 'Disable',
      },

      // Data settings
      data: {
        title: 'Data',
        exportData: {
          title: 'Export Data',
          description: 'Export your password data as CSV or JSON files',
          buttonText: 'Export Data',
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
        minute: 'minute',
        minutes: 'minutes',
      },

      // Settings transfer
      settingsTransfer: {
        export: 'Export',
        exportTitle: 'Export Settings',
        selectSaveLocation: 'Select Save Location',
        clickToSave: 'Click to select save location',
        saveAsJson: 'Save as JSON file',
        exportNote: 'The exported file contains your theme, language, navigation, and security preferences. Keep it safe!',
        import: 'Import',
        importTitle: 'Import Settings',
        selectFileToImport: 'Select File to Import',
        clickToSelect: 'Click to select settings file',
        selectJsonFile: 'Select JSON file',
        importNote: 'Importing settings will replace your current configuration. This action cannot be undone.',
        jsonFiles: 'JSON Files',
        allFiles: 'All Files',
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

    // Two-Factor Authentication    // 2fa
    twofa: {
      new: 'Add Two-Factor Authentication',
      selectQrCodeImage: 'Select a QR code image',
      dropHere: 'Drop the image here',
      clickToSelect: 'Click to select or drag & drop',
      instructions: 'Select a QR code image from your device',
      scanClipboard: 'Scan image from clipboard',
      processing: 'Processing...',
    },

    // Application-level 2FA
    app2fa: {
      verify: {
        title: 'Two-Factor Authentication',
        description: 'Enter the 6-digit code from your authenticator app.',
        placeholder: '000000',
        verifyButton: 'Verify',
        invalidCode: 'Invalid verification code. Please try again.',
        invalidBackupCode: 'Invalid backup code. Please try again.',
        locked: 'Too many failed attempts. 2FA is temporarily locked.',
        lockedMessage: 'Too many failed attempts. Try again in {{seconds}} seconds.',
        attemptsRemaining: '{{count}} attempt(s) remaining before lockout',
        backupTitle: 'Use Backup Code',
        backupDescription: 'Enter one of your unused backup codes.',
        backupPlaceholder: 'XXXX-XXXX',
        useBackupCode: 'Use a backup code',
        useAuthenticator: 'Use authenticator app',
      },
      setup: {
        title: 'Set Up Two-Factor Authentication',
        introDescription: 'Add an extra layer of security by requiring a code from your authenticator app each time you unlock.',
        requirement1: 'You will need an authenticator app (e.g., Google Authenticator, Authy)',
        requirement2: 'Save your backup codes in a safe place',
        startButton: 'Get Started',
        scanDescription: 'Scan this QR code with your authenticator app, or enter the secret key manually.',
        showSecret: 'Show secret key',
        hideSecret: 'Hide secret key',
        nextButton: 'Next',
        verifyDescription: 'Enter the 6-digit code shown in your authenticator app to verify the setup.',
        verifyButton: 'Verify & Enable',
        verifyError: 'Invalid code. Make sure your authenticator app is set up correctly.',
        backupDescription: 'Save these backup codes. Each code can only be used once. Store them somewhere safe.',
        backupWarning: 'These codes will not be shown again. Make sure to save them now!',
        copyBackupCodes: 'Copy Backup Codes',
        copied: 'Copied!',
        completeButton: 'Done',
        enabledSuccess: 'Two-factor authentication has been enabled.',
        disabledSuccess: 'Two-factor authentication has been disabled.',
      },
      disable: {
        title: 'Disable Two-Factor Authentication',
        description: 'To disable two-factor authentication, please verify your identity by entering your master password and a TOTP code from your authenticator app.',
        wrongPassword: 'Incorrect master password.',
        wrongCode: 'Invalid verification code.',
        failed: 'Failed to disable two-factor authentication.',
        confirmButton: 'Disable 2FA',
      },
    },
  },
}
