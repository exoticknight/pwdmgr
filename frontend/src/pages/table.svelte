<script lang='ts'>
  import { ArrowLeft, Copy, Edit, Eye, EyeOff, Lock, Plus, Save, Search, Trash2 } from '@lucide/svelte'
  import Fuse from 'fuse.js'
  import { onMount } from 'svelte'
  import i18next from '../i18n'
  import { userState } from '../store/user.svelte'
  import { navigationService, Routes } from '../utils/navigation'

  interface PasswordEntry {
    id: string
    title: string
    username: string
    password: string
    url?: string
    notes?: string
  }

  let searchTerm = $state('')
  let entries = $state<PasswordEntry[]>([])
  let hasUnsavedChanges = $state(false)
  const showPasswords = $state<{ [key: string]: boolean }>({})

  // Fuse.js 配置
  const fuseOptions = {
    keys: [
      { name: 'title', weight: 0.5 },
      { name: 'username', weight: 0.3 },
      { name: 'url', weight: 0.2 },
      { name: 'notes', weight: 0.1 },
    ],
    threshold: 0.4, // 模糊匹配阈值，0.0 = 完全匹配，1.0 = 完全不匹配
    includeScore: true,
    ignoreLocation: true,
    shouldSort: true,
  }

  let fuse: Fuse<PasswordEntry>

  onMount(() => {
    // 这里应该从后端加载密码数据
    // 暂时使用模拟数据
    entries = [
      {
        id: '1',
        title: 'Gmail',
        username: 'user@gmail.com',
        password: 'password123',
        url: 'https://gmail.com',
        notes: 'Personal email account',
      },
      {
        id: '2',
        title: 'GitHub',
        username: 'developer',
        password: 'securepass456',
        url: 'https://github.com',
        notes: 'Development account',
      },
    ]

    // 初始化 Fuse 实例（即使数据为空也可以初始化）
    fuse = new Fuse(entries, fuseOptions)
  })

  function togglePasswordVisibility(id: string) {
    showPasswords[id] = !showPasswords[id]
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
  // TODO: 显示复制成功提示
  }

  function editEntry(_id: string) {
    // TODO: 实现编辑功能
    hasUnsavedChanges = true
    // 编辑后，使用 setCollection 重建索引（因为条目内容可能变化）
    updateFuseInstance()
  }

  function deleteEntry(_id: string) {
    // TODO: 实现删除功能
    // entries = entries.filter(entry => entry.id !== id)
    hasUnsavedChanges = true
    // 删除后，使用 setCollection 更新（因为数组长度变化）
    updateFuseInstance()
  }

  function addNewEntry() {
    // TODO: 实现添加新条目功能
    // 示例：entries = [...entries, newEntry]
    hasUnsavedChanges = true
    // 添加后，使用 setCollection 更新
    updateFuseInstance()
  }

  function updateFuseInstance() {
    if (fuse) {
      fuse.setCollection(entries)
    }
    else {
      fuse = new Fuse(entries, fuseOptions)
    }
  }

  function handleSave() {
    if (!hasUnsavedChanges) {
      return
    }

    // TODO: 实现保存功能，将当前数据持久化
    // eslint-disable-next-line no-console
    console.log('保存数据到:', userState.dbPath)

    // 保存完成后清除未保存标记
    hasUnsavedChanges = false
  }

  function handleGoBack() {
    if (hasUnsavedChanges) {
      // eslint-disable-next-line no-alert
      const confirmLeave = window.confirm(i18next.t('warnings.unsavedChanges'))
      if (!confirmLeave) {
        return
      }
    }

    // 清除用户状态并返回到首页
    userState.dbPath = ''
    userState.password = ''
    userState.dbData = null
    userState.isNewDatabase = false

    navigationService.navigate(Routes.HOME)
  }

  const filteredEntries = $derived.by(() => {
    if (!searchTerm || !fuse) {
      return entries
    }

    // 使用 Fuse.js 进行模糊搜索
    const results = fuse.search(searchTerm)
    return results.map(result => result.item)
  })
</script>

<div class='min-h-screen bg-base-100'>
  <div class='border-b border-base-300 p-4'>
    <div class='max-w-6xl mx-auto flex items-center justify-between'>
      <!-- 左侧：返回按钮和信息 -->
      <div class='flex items-center gap-4'>
        <button
          class='btn btn-ghost btn-sm'
          class:btn-warning={hasUnsavedChanges}
          onclick={handleGoBack}
          title={hasUnsavedChanges ? i18next.t('warnings.unsavedChanges') : i18next.t('actions.back')}
        >
          <ArrowLeft class='w-4 h-4' />
        </button>

        <!-- 信息显示 -->
        <div class='text-sm text-base-content/70'>
          <span class='font-medium'>{filteredEntries.length}</span>
          {filteredEntries.length === 1 ? i18next.t('stats.entry') : i18next.t('stats.entries')}
          {#if searchTerm && filteredEntries.length !== entries.length}
            <span class='text-base-content/50'>
              / {entries.length} {i18next.t('stats.total')}
            </span>
          {/if}
        </div>
      </div>

      <!-- 右侧：搜索框和操作按钮组 -->
      <div class='flex items-center gap-3'>
        <!-- 搜索框 -->
        <label class='input input-sm w-64 flex'>
          <Search class='w-4 h-4 text-base-content/60' />
          <input
            type='search'
            class='grow'
            placeholder={i18next.t('search.placeholder')}
            bind:value={searchTerm}
          />
        </label>

        <!-- 操作按钮 -->
        <button class='btn btn-primary btn-sm' onclick={addNewEntry}>
          <Plus class='w-4 h-4 mr-2' />
          {i18next.t('actions.addNew')}
        </button>

        <button
          class='btn btn-secondary btn-sm'
          onclick={handleSave}
          disabled={!hasUnsavedChanges}
          title={hasUnsavedChanges ? i18next.t('actions.save') : i18next.t('actions.allSaved')}
        >
          <Save class='w-4 h-4 mr-2' />
          {i18next.t('actions.save')}
        </button>
      </div>
    </div>
  </div>

  <!-- 主内容区域 -->
  <div class='max-w-6xl mx-auto p-4'>
    {#if filteredEntries.length === 0}
      <div class='text-center py-16'>
        <Lock class='w-16 h-16 mx-auto mb-4 text-base-content/30' />
        <p class='text-lg mb-2'>{searchTerm ? i18next.t('search.noResults') : i18next.t('table.empty')}</p>
        {#if !searchTerm}
          <p class='text-base-content/60'>{i18next.t('table.helpText')}</p>
        {/if}
      </div>
    {:else}
      <!-- 表格 -->
      <div class='overflow-x-auto'>
        <table class='table w-full'>
          <thead>
            <tr>
              <th>{i18next.t('table.title')}</th>
              <th>{i18next.t('table.username')}</th>
              <th>{i18next.t('table.password')}</th>
              <th>{i18next.t('table.url')}</th>
              <th>{i18next.t('table.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {#each filteredEntries as entry (entry.id)}
              <tr class='hover'>
                <td>
                  <div class='font-medium text-gray-900'>{entry.title}</div>
                  {#if entry.notes}
                    <div class='text-sm text-gray-500'>{entry.notes}</div>
                  {/if}
                </td>
                <td>
                  <div class='flex items-center gap-2'>
                    <span class='font-mono text-sm selectable' id={`username-${entry.id}`}>{entry.username}</span>
                    <button
                      class='btn btn-ghost btn-xs'
                      onclick={() => copyToClipboard(entry.username)}
                      title={i18next.t('actions.copy')}
                    >
                      <Copy class='w-3 h-3' />
                    </button>
                  </div>
                </td>
                <td>
                  <div class='flex items-center gap-2'>
                    <span class='font-mono text-sm selectable' id={`password-${entry.id}`}>
                      {showPasswords[entry.id] ? entry.password : '••••••••'}
                    </span>
                    <button
                      class='btn btn-ghost btn-xs'
                      onclick={() => togglePasswordVisibility(entry.id)}
                      title={showPasswords[entry.id] ? i18next.t('actions.hide') : i18next.t('actions.show')}
                    >
                      {#if showPasswords[entry.id]}
                        <EyeOff class='w-3 h-3' />
                      {:else}
                        <Eye class='w-3 h-3' />
                      {/if}
                    </button>
                    <button
                      class='btn btn-ghost btn-xs'
                      onclick={() => copyToClipboard(entry.password)}
                      title={i18next.t('actions.copy')}
                    >
                      <Copy class='w-3 h-3' />
                    </button>
                  </div>
                </td>
                <td>
                  {#if entry.url}
                    <a
                      href={entry.url}
                      target='_blank'
                      rel='noopener noreferrer'
                      class='link link-primary text-sm selectable'
                    >
                      {entry.url}
                    </a>
                  {:else}
                    <span class='text-base-content/50'>-</span>
                  {/if}
                </td>
                <td>
                  <div class='flex gap-1'>
                    <button
                      class='btn btn-ghost btn-xs'
                      onclick={() => editEntry(entry.id)}
                      title={i18next.t('actions.edit')}
                    >
                      <Edit class='w-3 h-3' />
                    </button>
                    <button
                      class='btn btn-ghost btn-xs btn-error'
                      onclick={() => deleteEntry(entry.id)}
                      title={i18next.t('actions.delete')}
                    >
                      <Trash2 class='w-3 h-3' />
                    </button>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</div>
