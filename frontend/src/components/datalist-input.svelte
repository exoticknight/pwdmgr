<script lang='ts'>
  /**
   * A text input with dropdown list autocomplete suggestions
   * Supports custom value display and selection handling
   */

  interface Option {
    /** The value to be used when selected */
    value: string
    /** The display label shown in the dropdown */
    label: string
  }

  interface Props {
    /** Unique ID for the input and datalist */
    id: string
    /** Current value of the input */
    value?: string
    /** Placeholder text */
    placeholder?: string
    /** List of options for autocomplete */
    options: Option[]
    /** Additional CSS classes for the input */
    class?: string
    /** Whether the field is required */
    required?: boolean
    /** Debounce delay in milliseconds for filtering */
    debounce?: number
    /** Width mode for the dropdown list: 'fit-content' adapts to content, 'match-input' matches input width */
    listWidth?: 'fit-content' | 'match-input'
    /** Called when the input value changes */
    oninput?: (value: string) => void
    /** Called when an option is selected (value matches an option) */
    onselect?: (option: Option) => void
  }

  const {
    id,
    value = '',
    placeholder = '',
    options,
    class: className = '',
    required = false,
    debounce: debounceMs = 300,
    listWidth = 'fit-content',
    oninput,
    onselect,
  }: Props = $props()

  let isOpen = $state(false)
  let highlightedIndex = $state(-1)
  let inputElement: HTMLInputElement
  let debouncedValue = $state('')
  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  // Filter options based on debounced input value (empty input = no results)
  const filteredOptions = $derived(
    debouncedValue
      ? options.filter((opt) => {
        const lowerValue = debouncedValue.toLowerCase()
        return opt.label.toLowerCase().includes(lowerValue)
          || opt.value.toLowerCase().includes(lowerValue)
      })
      : [],
  )

  function handleInput(e: Event) {
    const input = e.currentTarget as HTMLInputElement
    const inputValue = input.value

    oninput?.(inputValue)
    highlightedIndex = -1

    // Clear existing debounce timer
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    // Debounce the filtering
    debounceTimer = setTimeout(() => {
      debouncedValue = inputValue
      // Only open if there's input
      isOpen = inputValue.length > 0
    }, debounceMs)

    // Check if the input matches an option exactly
    const matchedOption = options.find(
      opt => opt.label === inputValue || opt.value === inputValue,
    )

    if (matchedOption) {
      onselect?.(matchedOption)
    }
  }

  function handleFocus() {
    // Only open if there's input value
    if (value && value.length > 0) {
      debouncedValue = value
      isOpen = true
    }
  }

  function handleBlur() {
    // Delay closing to allow click events on options
    setTimeout(() => {
      isOpen = false
      highlightedIndex = -1
    }, 150)
  }

  function handleKeydown(e: KeyboardEvent) {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        isOpen = true
        e.preventDefault()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        highlightedIndex
          = highlightedIndex < filteredOptions.length - 1
            ? highlightedIndex + 1
            : 0
        break
      case 'ArrowUp':
        e.preventDefault()
        highlightedIndex
          = highlightedIndex > 0
            ? highlightedIndex - 1
            : filteredOptions.length - 1
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          selectOption(filteredOptions[highlightedIndex])
        }
        break
      case 'Escape':
        isOpen = false
        highlightedIndex = -1
        break
    }
  }

  function selectOption(option: Option) {
    oninput?.(option.label)
    onselect?.(option)
    isOpen = false
    highlightedIndex = -1
    inputElement?.focus()
  }
</script>

<div class='datalist-input-wrapper'>
  <input
    {id}
    bind:this={inputElement}
    type='text'
    class={`input w-full ${className}`}
    {value}
    oninput={handleInput}
    onfocus={handleFocus}
    onblur={handleBlur}
    onkeydown={handleKeydown}
    {placeholder}
    {required}
    autocomplete='off'
    role='combobox'
    aria-expanded={isOpen}
    aria-controls={`${id}-listbox`}
    aria-activedescendant={highlightedIndex >= 0 ? `${id}-option-${highlightedIndex}` : undefined}
  />

  {#if isOpen && value && value.length > 0 && filteredOptions.length > 0}
    <ul
      id={`${id}-listbox`}
      class='options-list'
      class:fit-content={listWidth === 'fit-content'}
      class:match-input={listWidth === 'match-input'}
      role='listbox'
    >
      {#each filteredOptions as option, index}
        <li
          id={`${id}-option-${index}`}
          class='option-item'
          class:highlighted={index === highlightedIndex}
          role='option'
          aria-selected={index === highlightedIndex}
          onmousedown={() => selectOption(option)}
          onmouseenter={() => (highlightedIndex = index)}
        >
          {#if option.label !== option.value}
            <span class='option-value'>{option.value}</span>
          {/if}
          <span class='option-label'>{option.label}</span>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .datalist-input-wrapper {
    position: relative;
    width: 100%;
  }

  .options-list {
    position: absolute;
    top: 100%;
    left: 0;
    z-index: 50;
    overflow-y: auto;
    margin: 0;
    padding: 0;
    list-style: none;
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border);
    border-radius: var(--rounded-box, 0.5rem);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }

  .options-list.fit-content {
    width: max-content;
  }

  .options-list.fit-content .option-item {
    white-space: nowrap;
  }

  .options-list.match-input {
    right: 0;
  }

  .option-item {
    display: flex;
    gap: 0.5rem;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0.75rem;
    cursor: pointer;
    transition: background-color 0.15s ease;
  }

  .option-item:hover,
  .option-item.highlighted {
    background: var(--color-bg-tertiary);
  }

  .option-label {
    font-weight: 500;
  }

  .option-value {
    font-size: 0.875rem;
    opacity: 0.7;
  }
</style>
