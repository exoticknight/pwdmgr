<script lang='ts'>
  import { Plus } from '@lucide/svelte'
  import ErrorAlert from '../components/error-alert.svelte'
  import FileDropZone from '../components/file-drop-zone.svelte'
  import PasswordForm from '../components/password-form.svelte'
  import { PASSWORD_FILE_CONFIG } from '../config/file-config'
  import i18next from '../i18n'
  import { userState } from '../store/user.svelte'
  import { navigationService } from '../utils/navigation'

  let showPasswordInput = $state(false)
  let selectedFile = $state<File | null>(null)
  let selectedFilePath = $state<string>('')
  let isNewDatabase = $state(false)
  let password = $state('')
  let confirmPassword = $state('')
  let error = $state('')

  function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement
    const files = input.files
    if (files && files.length > 0) {
      handleFileSelection(files[0])
    }
  }

  function handleFileDrop(filePaths: string[]) {
    if (filePaths.length > 0) {
      const filePath = filePaths[0]
      const fileName = filePath.split('/').pop() || filePath.split('\\').pop() || filePath

      if (PASSWORD_FILE_CONFIG.isValidFile(fileName)) {
        selectedFilePath = filePath
        selectedFile = null
        isNewDatabase = false
        showPasswordInput = true
        error = ''
      }
      else {
        error = PASSWORD_FILE_CONFIG.errorMessage
      }
    }
  }

  function handleFileSelection(file: File) {
    if (PASSWORD_FILE_CONFIG.isValidFile(file.name)) {
      selectedFile = file
      selectedFilePath = ''
      isNewDatabase = false
      showPasswordInput = true
      error = ''
    }
    else {
      error = PASSWORD_FILE_CONFIG.errorMessage
    }
  }

  function createNewDatabase() {
    isNewDatabase = true
    selectedFile = null
    selectedFilePath = ''
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
      // 处理浏览器选择的文件
      const reader = new FileReader()
      reader.onload = () => {
        userState.dbPath = selectedFile!.name
        userState.password = password
        userState.dbData = reader.result as ArrayBuffer
        userState.isNewDatabase = false
        // 使用导航服务
        navigationService.navigate('/table')
      }
      reader.readAsArrayBuffer(selectedFile)
    }
    else if (selectedFilePath) {
      userState.dbPath = selectedFilePath
      userState.password = password
      userState.dbData = null // 使用路径时，由后端处理文件读取
      userState.isNewDatabase = false
      navigationService.navigate('/table')
    }
    else if (isNewDatabase) {
      userState.dbPath = 'new_passwords.pwd'
      userState.password = password
      userState.dbData = null
      userState.isNewDatabase = true
      navigationService.navigate('/table')
    }
  }

  function resetState() {
    showPasswordInput = false
    selectedFile = null
    selectedFilePath = ''
    isNewDatabase = false
    password = ''
    confirmPassword = ''
    error = ''
  }

  const displayFileName = $derived(
    selectedFile?.name || getFileNameFromPath(selectedFilePath),
  )

  function getFileNameFromPath(path: string): string {
    if (!path) {
      return ''
    }
    return path.split('/').pop() || path.split('\\').pop() || path
  }
</script>

<div class='min-h-screen bg-base-100 flex items-center justify-center p-8'>
  <div class='w-full max-w-lg'>
    {#if !showPasswordInput}
      <FileDropZone
        onFileSelect={handleFileSelect}
        onFileDrop={handleFileDrop}
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
