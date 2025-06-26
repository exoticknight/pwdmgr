<script lang='ts'>
  import { Plus } from '@lucide/svelte'
  import { goto } from '@mateothegreat/svelte5-router'
  import { onMount } from 'svelte'
  import ErrorAlert from '../components/error-alert.svelte'
  import FileDropZone from '../components/file-drop-zone.svelte'
  import PasswordForm from '../components/password-form.svelte'
  import { PASSWORD_FILE_CONFIG } from '../config/file-config'
  import { t } from '../hooks/use-translation'
  import { userState } from '../store/user.svelte'

  let showPasswordInput = $state(false)
  let selectedFile = $state<File | null>(null)
  let selectedFilePath = $state<string>('')
  let isNewDatabase = $state(false)
  let password = $state('')
  let confirmPassword = $state('')
  let error = $state('')

  onMount(() => {
  // Component mounted
  })

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
        selectedFile = null // 使用文件路径而非 File 对象
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
      error = t('errors.passwordRequired')
      return
    }

    if (isNewDatabase && password !== confirmPassword) {
      error = t('errors.passwordMismatch')
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
        goto('/table')
      }
      reader.readAsArrayBuffer(selectedFile)
    }
    else if (selectedFilePath) {
      // 处理 Wails 拖放的文件路径
      userState.dbPath = selectedFilePath
      userState.password = password
      userState.dbData = null // 使用路径时，由后端处理文件读取
      userState.isNewDatabase = false
      goto('/table')
    }
    else if (isNewDatabase) {
      // 创建新数据库
      userState.dbPath = 'new_passwords.pwd'
      userState.password = password
      userState.dbData = null
      userState.isNewDatabase = true
      goto('/table')
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

  // 计算显示的文件名
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

<div class='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4'>
  <div class='w-full max-w-md'>
    {#if !showPasswordInput}
      <!-- 文件拖放区域 -->
      <div class='bg-white rounded-xl shadow-xl p-8 transition-all duration-300'>
        <div class='text-center mb-8'>
          <p class='text-gray-600'>{t('landing.description')}</p>
        </div>

        <FileDropZone
          onFileSelect={handleFileSelect}
          onFileDrop={handleFileDrop}
        />

        <div class='divider my-6'>{t('actions.or')}</div>

        <!-- 新建数据库按钮 -->
        <button
          class='btn btn-primary w-full'
          onclick={createNewDatabase}
        >
          <Plus class='w-5 h-5 mr-2' />
          {t('actions.createNew')}
        </button>

        <ErrorAlert {error} />
      </div>
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
