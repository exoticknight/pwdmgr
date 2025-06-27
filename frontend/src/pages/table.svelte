<script lang='ts'>
  import type { PasswordEntry } from '../types/password'
  import { onMount } from 'svelte'
  import EmptyState from '../components/empty-state.svelte'
  import PasswordEntryRow from '../components/password-entry-row.svelte'
  import TableHeader from '../components/table-header.svelte'
  import i18next from '../i18n'
  import { PasswordManager } from '../stores/password.svelte'
  import { userState } from '../stores/user.svelte'
  import { navigationService, Routes } from '../utils/navigation'

  // 初始化密码管理器
  const passwordManager = new PasswordManager()

  onMount(() => {
    // 这里应该从后端加载密码数据
    // 暂时使用模拟数据
    const mockData: PasswordEntry[] = [
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
    passwordManager.setEntries(mockData)
  })

  // 事件处理器
  function handleGoBack() {
    if (passwordManager.hasUnsavedChanges) {
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

  function handleSearchChange(term: string) {
    passwordManager.setSearchTerm(term)
  }

  function handleAddNew() {
    // TODO: 实现添加新条目功能
    // eslint-disable-next-line no-console
    console.log('添加新条目')
  }

  function handleSave() {
    if (!passwordManager.hasUnsavedChanges) {
      return
    }

    // TODO: 实现保存功能，将当前数据持久化
    // eslint-disable-next-line no-console
    console.log('保存数据到:', userState.dbPath)

    // 保存完成后清除未保存标记
    passwordManager.markAsSaved()
  }

  function handleEditEntry(id: string) {
    // TODO: 实现编辑功能
    // eslint-disable-next-line no-console
    console.log('编辑条目:', id)
  }

  function handleDeleteEntry(id: string) {
    // TODO: 实现删除功能
    // eslint-disable-next-line no-console
    console.log('删除条目:', id)
  // passwordManager.deleteEntry(id)
  }

  function handleCopyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
  // TODO: 显示复制成功提示
  }
</script>

<div class='min-h-screen bg-base-100'>
  <TableHeader
    hasUnsavedChanges={passwordManager.hasUnsavedChanges}
    bind:searchTerm={passwordManager.searchTerm}
    filteredCount={passwordManager.filteredEntries.length}
    totalCount={passwordManager.entries.length}
    onGoBack={handleGoBack}
    onSearchChange={handleSearchChange}
    onAddNew={handleAddNew}
    onSave={handleSave}
  />

  <!-- 主内容区域 -->
  <div class='max-w-6xl mx-auto p-4'>
    {#if passwordManager.filteredEntries.length === 0}
      <EmptyState isSearching={!!passwordManager.searchTerm} />
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
            {#each passwordManager.filteredEntries as entry (entry.id)}
              <PasswordEntryRow
                {entry}
                showPassword={passwordManager.showPasswords[entry.id] || false}
                onTogglePassword={() => passwordManager.togglePasswordVisibility(entry.id)}
                onCopyUsername={() => handleCopyToClipboard(entry.username)}
                onCopyPassword={() => handleCopyToClipboard(entry.password)}
                onEdit={() => handleEditEntry(entry.id)}
                onDelete={() => handleDeleteEntry(entry.id)}
              />
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</div>
