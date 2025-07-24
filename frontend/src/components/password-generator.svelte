<script lang='ts'>
  import type { PasswordGeneratorOptions } from '@/utils/password-generator'
  import { Check, Copy, RefreshCcw } from '@lucide/svelte'
  import i18next from '@/i18n'
  import { PasswordGenerator } from '@/utils/password-generator'
  import PasswordStrength from './password-strength.svelte'

  interface Props {
    onSelect?: (password: string) => void
    onCopy?: (password: string) => void
    length?: number
    includeUppercase?: boolean
    includeLowercase?: boolean
    includeNumbers?: boolean
    includeSymbols?: boolean
    excludeSimilar?: boolean
    excludeAmbiguous?: boolean
  }

  const {
    onSelect,
    onCopy,
    length = 16,
    includeUppercase = true,
    includeLowercase = true,
    includeNumbers = true,
    includeSymbols = true,
    excludeSimilar = false,
    excludeAmbiguous = false,
  }: Props = $props()

  // 拆开成独立的状态
  let passwordLength = $state(length)
  let includeUppercaseState = $state(includeUppercase)
  let includeLowercaseState = $state(includeLowercase)
  let includeNumbersState = $state(includeNumbers)
  let includeSymbolsState = $state(includeSymbols)
  let excludeSimilarState = $state(excludeSimilar)
  let excludeAmbiguousState = $state(excludeAmbiguous)

  // 派生的options对象，会自动跟踪所有状态变化
  const options = $derived<PasswordGeneratorOptions>({
    length: passwordLength,
    includeUppercase: includeUppercaseState,
    includeLowercase: includeLowercaseState,
    includeNumbers: includeNumbersState,
    includeSymbols: includeSymbolsState,
    excludeSimilar: excludeSimilarState,
    excludeAmbiguous: excludeAmbiguousState,
  })

  // 检查是否只有一个字符类型被选中
  const hasOnlyOneCharType = $derived(
    [includeUppercaseState, includeLowercaseState, includeNumbersState, includeSymbolsState].filter(Boolean).length === 1,
  )

  // 派生的密码，会在options变化时自动重新生成
  const generatedPassword = $derived(PasswordGenerator.generate(options))

  // 生成密码（手动刷新）
  function regeneratePassword() {
    // 通过稍微修改然后恢复一个值来强制重新生成
    const temp = passwordLength
    passwordLength = temp + 1
    passwordLength = temp
  }

  // 处理字符类型复选框点击，阻止取消最后一个选项
  function handleCharTypeClick(type: 'uppercase' | 'lowercase' | 'numbers' | 'symbols', event: Event) {
    const target = event.currentTarget as HTMLInputElement
    const newValue = target.checked

    // 如果是要取消勾选，且只剩一个选项，则强制设置回选中状态
    if (!newValue && hasOnlyOneCharType) {
      target.checked = true
      return
    }

    // 否则更新对应的状态
    switch (type) {
      case 'uppercase':
        includeUppercaseState = newValue
        break
      case 'lowercase':
        includeLowercaseState = newValue
        break
      case 'numbers':
        includeNumbersState = newValue
        break
      case 'symbols':
        includeSymbolsState = newValue
        break
    }
  }

  // 复制密码
  function copyPassword() {
    if (generatedPassword) {
      onCopy?.(generatedPassword)
    }
  }

  // 选择密码
  function selectPassword() {
    if (generatedPassword) {
      onSelect?.(generatedPassword)
    }
  }

  // 当外部 props 变化时同步内部状态
  $effect(() => {
    passwordLength = length
    includeUppercaseState = includeUppercase
    includeLowercaseState = includeLowercase
    includeNumbersState = includeNumbers
    includeSymbolsState = includeSymbols
    excludeSimilarState = excludeSimilar
    excludeAmbiguousState = excludeAmbiguous
  })
</script>

<div class='space-y-4'>
  <!-- 密码输出区域 -->
  <div class='form-control'>
    <div class='join w-full'>
      <input
        type='text'
        class='input input-bordered join-item flex-1 font-mono'
        value={generatedPassword}
        readonly
      />
      <button
        class='btn join-item'
        onclick={regeneratePassword}
        title={i18next.t('passwordGenerator.regenerate')}
      >
        <RefreshCcw size={16} />
      </button>
      {#if onSelect}
        <button
          class='btn join-item'
          onclick={selectPassword}
          title={i18next.t('passwordGenerator.usePassword')}
        >
          <Check size={16} />
        </button>
      {/if}
      {#if onCopy}
        <button
          class='btn btn-outline join-item'
          onclick={copyPassword}
          title={i18next.t('actions.copy')}
        >
          <Copy size={16} />
        </button>
      {/if}
    </div>
  </div>

  <PasswordStrength alwaysShow={true} password={generatedPassword} />

  <!-- 生成选项 -->
  <div class='form-control flex flex-col gap-2'>
    <!-- 长度设置 -->
    <div class='label'>
      <span class='label-text font-medium'>{i18next.t('passwordGenerator.length')}</span>
      <span class='label-text-alt badge badge-neutral'>{passwordLength}</span>
    </div>
    <input
      type='range'
      min='6'
      max='32'
      step='1'
      class='range w-full'
      bind:value={passwordLength}
    />
  </div>

  <!-- 字符类型选择 -->
  <div class='form-control'>
    <div class='flex flex-col gap-2'>
      <label class='label cursor-pointer'>
        <input
          type='checkbox'
          class='checkbox'
          checked={includeUppercaseState}
          onclick={e => handleCharTypeClick('uppercase', e)}
        />
        <span class='label-text'>{i18next.t('passwordGenerator.includeUppercase')}</span>
      </label>
      <label class='label cursor-pointer'>
        <input
          type='checkbox'
          class='checkbox'
          checked={includeLowercaseState}
          onclick={e => handleCharTypeClick('lowercase', e)}
        />
        <span class='label-text'>{i18next.t('passwordGenerator.includeLowercase')}</span>
      </label>
      <label class='label cursor-pointer'>
        <input
          type='checkbox'
          class='checkbox'
          checked={includeNumbersState}
          onclick={e => handleCharTypeClick('numbers', e)}
        />
        <span class='label-text'>{i18next.t('passwordGenerator.includeNumbers')}</span>
      </label>
      <label class='label cursor-pointer'>
        <input
          type='checkbox'
          class='checkbox'
          checked={includeSymbolsState}
          onclick={e => handleCharTypeClick('symbols', e)}
        />
        <span class='label-text'>{i18next.t('passwordGenerator.includeSymbols')}</span>
      </label>
    </div>
  </div>

  <!-- 排除选项 -->
  <div class='form-control'>
    <div class='flex flex-col gap-2'>
      <label class='label cursor-pointer'>
        <input type='checkbox' class='checkbox' bind:checked={excludeSimilarState} />
        <span class='label-text'>{i18next.t('passwordGenerator.excludeSimilar')}</span>
      </label>
      <label class='label cursor-pointer'>
        <input type='checkbox' class='checkbox' bind:checked={excludeAmbiguousState} />
        <span class='label-text'>{i18next.t('passwordGenerator.excludeAmbiguous')}</span>
      </label>
    </div>
  </div>
</div>

<style>
</style>
