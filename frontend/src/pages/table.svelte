<script lang='ts'>
  import { Copy, Edit, Eye, EyeOff, Lock, Plus, Search, Trash2 } from '@lucide/svelte'
  import { onMount } from 'svelte'
  import { t } from '../hooks/use-translation'
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

<div class='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4'>
  <div class='max-w-6xl mx-auto'>
    <!-- 头部 -->
    <div class='bg-white rounded-xl shadow-lg p-6 mb-6'>
      <div class='flex items-center justify-between mb-4'>
        <div class='flex items-center gap-3'>
          <div class='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center'>
            <Lock class='w-5 h-5 text-blue-600' />
          </div>
          <div>
            <h1 class='text-2xl font-bold text-gray-800'>{t('app.title')}</h1>
            <p class='text-gray-600'>{userState.dbPath}</p>
          </div>
        </div>

        <button class='btn btn-primary' onclick={addNewEntry}>
          <Plus class='w-5 h-5 mr-2' />
          {t('actions.addNew')}
        </button>
      </div>

      <!-- 搜索框 -->
      <div class='relative'>
        <Search class='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400' />
        <input
          type='text'
          class='input input-bordered w-full pl-10'
          placeholder={t('search.placeholder')}
          bind:value={searchTerm}
        />
      </div>
    </div>

    <!-- 密码条目列表 -->
    <div class='bg-white rounded-xl shadow-lg overflow-hidden'>
      {#if filteredEntries.length === 0}
        <div class='p-8 text-center text-gray-500'>
          <Lock class='w-12 h-12 mx-auto mb-4 text-gray-300' />
          <p>{searchTerm ? t('search.noResults') : t('table.empty')}</p>
        </div>
      {:else}
        <div class='overflow-x-auto'>
          <table class='table table-zebra w-full'>
            <thead>
              <tr>
                <th>{t('table.title')}</th>
                <th>{t('table.username')}</th>
                <th>{t('table.password')}</th>
                <th>{t('table.url')}</th>
                <th>{t('table.actions')}</th>
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
                      <span class='font-mono text-sm'>{entry.username}</span>
                      <button
                        class='btn btn-ghost btn-xs'
                        onclick={() => copyToClipboard(entry.username)}
                        title={t('actions.copy')}
                      >
                        <Copy class='w-3 h-3' />
                      </button>
                    </div>
                  </td>
                  <td>
                    <div class='flex items-center gap-2'>
                      <span class='font-mono text-sm'>
                        {showPasswords[entry.id] ? entry.password : '••••••••'}
                      </span>
                      <button
                        class='btn btn-ghost btn-xs'
                        onclick={() => togglePasswordVisibility(entry.id)}
                        title={showPasswords[entry.id] ? t('actions.hide') : t('actions.show')}
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
                        title={t('actions.copy')}
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
                        class='link link-primary text-sm'
                      >
                        {entry.url}
                      </a>
                    {:else}
                      <span class='text-gray-400'>-</span>
                    {/if}
                  </td>
                  <td>
                    <div class='flex gap-1'>
                      <button
                        class='btn btn-ghost btn-xs'
                        onclick={() => editEntry(entry.id)}
                        title={t('actions.edit')}
                      >
                        <Edit class='w-3 h-3' />
                      </button>
                      <button
                        class='btn btn-ghost btn-xs text-error'
                        onclick={() => deleteEntry(entry.id)}
                        title={t('actions.delete')}
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
</div>
