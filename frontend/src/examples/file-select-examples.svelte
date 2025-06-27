<script lang='ts'>
  // Usage examples: New WailsFileSelect component usage
  import WailsFileSelect from '../components/wails-file-select.svelte'
  import { getFileService } from '../services/file'

  const fileService = getFileService()

  // 1. Open existing password file
  async function handleOpenPasswordFile(filePaths: string[]) {
    if (filePaths.length > 0) {
      const filePath = filePaths[0]
      try {
        const _fileData = await fileService.readFile(filePath)
      // Process password file data...
      }
      catch (error) {
        console.error('Failed to read password file:', error)
      }
    }
  }

  // 2. Save password file
  async function handleSavePasswordFile(filePaths: string[]) {
    if (filePaths.length > 0) {
      const filePath = filePaths[0]
      try {
        const data = new ArrayBuffer(0) // Your password data
        await fileService.saveFile(filePath, data)
      }
      catch (error) {
        console.error('Failed to save password file:', error)
      }
    }
  }

  // 3. Import multiple config files
  async function handleImportConfigs(filePaths: string[]) {
    for (const filePath of filePaths) {
      try {
        const _data = await fileService.readFile(filePath)
      // Process config files...
      }
      catch (error) {
        console.error('Failed to import config:', filePath, error)
      }
    }
  }
</script>

<div class='container mx-auto p-6 space-y-8'>
  <h1 class='text-3xl font-bold mb-8'>Wails File Select Examples</h1>

  <!-- 示例 1: 打开密码文件 -->
  <section class='space-y-4'>
    <h2 class='text-2xl font-semibold'>1. 打开密码文件</h2>
    <WailsFileSelect
      config={{
        dialog: {
          title: '选择密码文件',
          filters: [
            { displayName: '密码文件 (*.pwd)', pattern: '*.pwd' },
            { displayName: '数据文件 (*.dat)', pattern: '*.dat' },
            { displayName: '所有文件 (*.*)', pattern: '*.*' },
          ],
        },
        behavior: {
          mode: 'open',
          multiple: false,
          enableDrop: true,
          dropFilter: paths => paths.filter(path =>
            path.toLowerCase().endsWith('.pwd')
            || path.toLowerCase().endsWith('.dat'),
          ),
        },
        text: {
          title: '选择密码文件',
          description: '点击选择或拖拽密码文件到此处',
          formats: '*.pwd, *.dat',
        },
        appearance: {
          icon: 'file',
        },
      }}
      onSelect={handleOpenPasswordFile}
    />
  </section>

  <!-- 示例 2: 保存密码文件 -->
  <section class='space-y-4'>
    <h2 class='text-2xl font-semibold'>2. 保存密码文件</h2>
    <WailsFileSelect
      config={{
        dialog: {
          title: '保存密码文件',
          defaultFilename: 'passwords.pwd',
          filters: [
            { displayName: '密码文件 (*.pwd)', pattern: '*.pwd' },
          ],
          canCreateDirs: true,
        },
        behavior: {
          mode: 'save',
          enableDrop: false,
        },
        text: {
          title: '点击选择保存位置',
          description: '选择文件保存位置',
          saveHint: '请选择保存位置',
        },
        appearance: {
          icon: 'save',
        },
      }}
      onSelect={handleSavePasswordFile}
    />
  </section>

  <!-- 示例 3: 导入多个配置文件 -->
  <section class='space-y-4'>
    <h2 class='text-2xl font-semibold'>3. 导入多个配置文件</h2>
    <WailsFileSelect
      config={{
        dialog: {
          title: '选择配置文件',
          filters: [
            { displayName: 'JSON 文件 (*.json)', pattern: '*.json' },
            { displayName: 'YAML 文件 (*.yml;*.yaml)', pattern: '*.yml;*.yaml' },
            { displayName: '所有文件 (*.*)', pattern: '*.*' },
          ],
        },
        behavior: {
          mode: 'open',
          multiple: true,
          enableDrop: true,
          dropFilter: paths => paths.filter((path) => {
            const lower = path.toLowerCase()
            return lower.endsWith('.json')
              || lower.endsWith('.yml')
              || lower.endsWith('.yaml')
          }),
        },
        text: {
          title: '选择多个配置文件',
          description: '可以选择多个文件进行批量导入',
          formats: '*.json, *.yml, *.yaml',
          multipleHint: '支持多文件选择',
        },
        appearance: {
          icon: 'files',
        },
      }}
      onSelect={handleImportConfigs}
    />
  </section>

  <!-- 示例 4: 禁用状态 -->
  <section class='space-y-4'>
    <h2 class='text-2xl font-semibold'>4. 禁用状态示例</h2>
    <WailsFileSelect
      config={{
        behavior: {
          disabled: true,
        },
        text: {
          title: '选择文件（已禁用）',
          description: '此功能暂时不可用',
        },
        appearance: {
          containerClass: 'border-2 border-dashed border-gray-300 rounded-lg p-6 text-center opacity-50',
        },
      }}
      onSelect={() => {}}
    />
  </section>

  <!-- 示例 5: 自定义样式 -->
  <section class='space-y-4'>
    <h2 class='text-2xl font-semibold'>5. 自定义样式</h2>
    <WailsFileSelect
      config={{
        text: {
          title: '选择文件',
          description: '这是一个带有自定义样式的文件选择器',
        },
        appearance: {
          icon: 'upload',
          containerClass: 'border-2 border-dashed border-blue-400 bg-blue-50 hover:bg-blue-100 rounded-lg p-6 text-center cursor-pointer transition-colors',
          titleClass: 'text-blue-700 text-lg font-semibold mb-2',
          descClass: 'text-blue-600 mb-4',
        },
      }}
      onSelect={(_paths) => { /* 处理文件选择 */ }}
    />
  </section>
</div>

<style>
  /* 可以添加一些自定义样式 */
  section {
    @apply border border-base-300 rounded-lg p-6;
  }

  h2 {
    @apply text-primary;
  }
</style>
