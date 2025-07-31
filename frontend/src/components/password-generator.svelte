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

  // Split into independent states
  let passwordLength = $state(length)
  let includeUppercaseState = $state(includeUppercase)
  let includeLowercaseState = $state(includeLowercase)
  let includeNumbersState = $state(includeNumbers)
  let includeSymbolsState = $state(includeSymbols)
  let excludeSimilarState = $state(excludeSimilar)
  let excludeAmbiguousState = $state(excludeAmbiguous)

  // Derived options object that automatically tracks all state changes
  const options = $derived<PasswordGeneratorOptions>({
    length: passwordLength,
    includeUppercase: includeUppercaseState,
    includeLowercase: includeLowercaseState,
    includeNumbers: includeNumbersState,
    includeSymbols: includeSymbolsState,
    excludeSimilar: excludeSimilarState,
    excludeAmbiguous: excludeAmbiguousState,
  })

  // Check if only one character type is selected
  const hasOnlyOneCharType = $derived(
    [includeUppercaseState, includeLowercaseState, includeNumbersState, includeSymbolsState].filter(Boolean).length === 1,
  )

  // Derived password that automatically regenerates when options change
  const generatedPassword = $derived(PasswordGenerator.generate(options))

  // Generate password (manual refresh)
  function regeneratePassword() {
    // Force regeneration by slightly modifying then restoring a value
    const temp = passwordLength
    passwordLength = temp + 1
    passwordLength = temp
  }

  // Handle character type checkbox click, prevent unchecking the last option
  function handleCharTypeClick(type: 'uppercase' | 'lowercase' | 'numbers' | 'symbols', event: Event) {
    const target = event.currentTarget as HTMLInputElement
    const newValue = target.checked

    // If trying to uncheck and only one option remains, force it back to checked
    if (!newValue && hasOnlyOneCharType) {
      target.checked = true
      return
    }

    // Otherwise update the corresponding state
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

  function copyPassword() {
    if (generatedPassword) {
      onCopy?.(generatedPassword)
    }
  }

  function selectPassword() {
    if (generatedPassword) {
      onSelect?.(generatedPassword)
    }
  }

  // Sync internal state when external props change
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
  <!-- Password output area -->
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

  <!-- Generation options -->
  <div class='form-control flex flex-col gap-2'>
    <!-- Length settings -->
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

  <!-- Character type selection -->
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

  <!-- Exclusion options -->
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
