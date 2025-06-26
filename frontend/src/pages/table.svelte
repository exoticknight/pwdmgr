<script lang='ts'>
  import { Copy, Edit, Eye, EyeOff, Lock, Plus, Search, Trash2 } from '@lucide/svelte'
  import { onMount } from 'svelte'
  import i18next from '../i18n'
  import { userState } from '../store/user.svelte'

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
  const showPasswords = $state<{ [key: string]: boolean }>({})

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
  }

  function deleteEntry(_id: string) {
  // TODO: 实现删除功能
  }

  function addNewEntry() {
  // TODO: 实现添加新条目功能
  }

  const filteredEntries = $derived.by(() => {
    if (!searchTerm) {
      return entries
    }
    const term = searchTerm.toLowerCase()
    return entries.filter((entry) => {
      const titleMatch = entry.title.toLowerCase().includes(term)
      const usernameMatch = entry.username.toLowerCase().includes(term)
      const urlMatch = entry.url && entry.url.toLowerCase().includes(term)
      return titleMatch || usernameMatch || urlMatch
    })
  })
</script>

<div class='min-h-screen bg-base-100'>
  <!-- 顶部工具栏 -->
  <div class='border-b border-base-300 p-4'>
    <div class='max-w-6xl mx-auto flex items-center justify-between'>
      <div class='flex items-center gap-3'>
        <div class='w-8 h-8 bg-primary text-primary-content rounded flex items-center justify-center'>
          <Lock class='w-4 h-4' />
        </div>
        <div>
          <p class='text-base font-semibold selectable'>{userState.dbPath}</p>
          <p class='text-xs text-base-content/60'>{i18next.t('database.label')}</p>
        </div>
      </div>

      <div class='flex items-center gap-3'>
        <!-- 搜索框 -->
        <div class='form-control'>
          <div class='input-group'>
            <span class='bg-base-200'>
              <Search class='w-4 h-4' />
            </span>
            <input
              type='text'
              class='input input-bordered input-sm w-64 selectable'
              placeholder={i18next.t('search.placeholder')}
              bind:value={searchTerm}
            />
          </div>
        </div>

        <button class='btn btn-primary btn-sm' onclick={addNewEntry}>
          <Plus class='w-4 h-4 mr-2' />
          {i18next.t('actions.addNew')}
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
