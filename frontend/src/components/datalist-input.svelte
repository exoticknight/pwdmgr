<script lang='ts'>
  /**
   * A text input with datalist autocomplete suggestions
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
    oninput,
    onselect,
  }: Props = $props()

  function handleInput(e: Event) {
    const input = e.currentTarget as HTMLInputElement
    const inputValue = input.value

    oninput?.(inputValue)

    // Check if the input matches an option
    const matchedOption = options.find(
      opt => opt.label === inputValue || opt.value === inputValue,
    )

    if (matchedOption) {
      onselect?.(matchedOption)
    }
  }
</script>

<input
  {id}
  type='text'
  class={`input w-full ${className}`}
  {value}
  oninput={handleInput}
  {placeholder}
  list={`${id}-suggestions`}
  {required}
/>
<datalist id={`${id}-suggestions`}>
  {#each options as option}
    <option value={option.value}>{option.label}</option>
  {/each}
</datalist>
