<script lang='ts'>
  import type { FileSelection } from '../types/file'
  import { Plus } from '@lucide/svelte'
  import ErrorAlert from '../components/error-alert.svelte'
  import FileDropZone from '../components/file-drop-zone.svelte'
  import PasswordForm from '../components/password-form.svelte'
  import { PASSWORD_FILE_CONFIG } from '../config/file-config'
  import i18next from '../i18n'
  import { userState } from '../stores/user.svelte'
  import { navigationService, Routes } from '../utils/navigation'

  let showPasswordInput = $state(false)
  let selectedFile = $state<File | null>(null)
  let isNewDatabase = $state(false)
  let password = $state('')
  let confirmPassword = $state('')
  let error = $state('')

  function validatePasswordFile(fileName: string) {
    return {
      isValid: PASSWORD_FILE_CONFIG.isValidFile(fileName),
      error: PASSWORD_FILE_CONFIG.isValidFile(fileName) ? undefined : PASSWORD_FILE_CONFIG.errorMessage,
    }
  }

  function handleFileSelected(selection: FileSelection) {
    if (!selection.isValid) {
      error = selection.error || 'Invalid file'
      return
    }

    error = ''
    isNewDatabase = false
    showPasswordInput = true
    selectedFile = selection.file
  }

  function createNewDatabase() {
    isNewDatabase = true
    selectedFile = null
    showPasswordInput = true
    error = ''
  }

  function handlePasswordSubmit(event: SubmitEvent) {
    event.preventDefault()
    if (!password) {
      error = i18next.t('errors.passwordRequired')
      return
    }

    if (isNewDatabase && password !== confirmPassword) {
      error = i18next.t('errors.passwordMismatch')
      return
    }

    processDatabase()
  }

  function processDatabase() {
    if (selectedFile) {
      // Handle file using FileReader
      const reader = new FileReader()
      reader.onload = () => {
        userState.dbPath = selectedFile!.name
        userState.password = password
        userState.dbData = reader.result as ArrayBuffer
        userState.isNewDatabase = false
        navigationService.navigate(Routes.TABLE)
      }
      reader.readAsArrayBuffer(selectedFile)
    }
    else if (isNewDatabase) {
      userState.dbPath = 'new_passwords.pwd'
      userState.password = password
      userState.dbData = null
      userState.isNewDatabase = true
      navigationService.navigate(Routes.TABLE)
    }
  }

  function resetState() {
    showPasswordInput = false
    selectedFile = null
    isNewDatabase = false
    password = ''
    confirmPassword = ''
    error = ''
  }

  const displayFileName = $derived(selectedFile?.name || '')
</script>

<div class='min-h-screen bg-base-100 flex items-center justify-center p-8'>
  <div class='w-full max-w-lg'>
    {#if !showPasswordInput}
      <FileDropZone
        onFileSelected={handleFileSelected}
        acceptAttribute={PASSWORD_FILE_CONFIG.acceptAttribute}
        validateFile={validatePasswordFile}
      />

      <div class='divider my-6'>{i18next.t('actions.or')}</div>

      <button
        class='btn btn-primary w-full'
        onclick={createNewDatabase}
      >
        <Plus class='w-5 h-5 mr-2' />
        {i18next.t('actions.createNew')}
      </button>

      <ErrorAlert {error} />
    {:else}
      <PasswordForm
        {isNewDatabase}
        selectedFile={selectedFile || { name: displayFileName } as File}
        bind:password
        bind:confirmPassword
        {error}
        onSubmit={handlePasswordSubmit}
        onReset={resetState}
      />
    {/if}
  </div>
</div>
