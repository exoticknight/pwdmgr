<script lang='ts'>
  interface RecoveryCodeInputProps {
    value?: string
    autoFocus?: boolean
    onInput?: (value: string) => void
  }

  let {
    value = $bindable(''),
    autoFocus = false,
    onInput,
  }: RecoveryCodeInputProps = $props()

  let contentEditableRef = $state<HTMLDivElement>()

  const formattedDisplay = $derived(formatDisplay(value))

  function formatDisplay(val: string) {
    const clean = val.replace(/[^a-z0-9]/gi, '').toUpperCase()
    const padded = clean.padEnd(32, '_') // 用下划线填充未输入部分

    const firstLine = padded.slice(0, 16)
    const secondLine = padded.slice(16, 32)

    return {
      firstLine: firstLine.replace(/(.{4})/g, '$1 ').trim(),
      secondLine: secondLine.replace(/(.{4})/g, '$1 ').trim(),
      complete: clean.length === 32,
      length: clean.length,
    }
  }

  function updateDisplay() {
    if (!contentEditableRef)
      return

    const display = formatDisplay(value)
    const firstLineHtml = formatLineToHtml(display.firstLine)
    const secondLineHtml = formatLineToHtml(display.secondLine)

    contentEditableRef.innerHTML = `
      <div class="text-center">
        <span class="text-lg md:text-xl tracking-widest font-semibold">${firstLineHtml}</span>
      </div>
      <div class="text-center">
        <span class="text-lg md:text-xl tracking-widest font-semibold">${secondLineHtml}</span>
      </div>
    `
  }

  function formatLineToHtml(line: string): string {
    return line.split('').map((char) => {
      if (char === '_') {
        return '<span class="text-base-content/30 select-none pointer-events-none">_</span>'
      }
      else if (char === ' ') {
        return '<span class="select-none pointer-events-none"> </span>'
      }
      else {
        return `<span class="text-base-content select-none pointer-events-none">${char}</span>`
      }
    }).join('')
  }

  function handleKeydown(e: KeyboardEvent) {
    const allowedKeys = [
      'Tab',
      'Escape',
      'Enter',
    ]

    const isCtrlKey = e.ctrlKey || e.metaKey
    const ctrlKeys = ['v', 'x', 'z'] // 只保留粘贴、剪切、撤销

    if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault()
      if (value.length > 0) {
        value = value.slice(0, -1) // 删除最后一个字符
        updateDisplay()
        onInput?.(value)
      }
      return
    }

    if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
      e.preventDefault()
      return
    }

    if (isCtrlKey && e.key.toLowerCase() === 'a') {
      e.preventDefault()
      return
    }

    if (allowedKeys.includes(e.key)
      || (isCtrlKey && ctrlKeys.includes(e.key.toLowerCase()))) {
      return
    }

    if (/^[a-z0-9]$/i.test(e.key)) {
      e.preventDefault()

      if (value.length < 32) {
        value = value + e.key.toUpperCase()
        updateDisplay()
        onInput?.(value)
      }
      return
    }

    e.preventDefault()
  }

  function handlePaste(e: ClipboardEvent) {
    e.preventDefault()

    const pastedText = e.clipboardData?.getData('text') || ''
    const cleaned = pastedText.replace(/[^a-z0-9]/gi, '').toUpperCase()

    if (cleaned.length > 0) {
      value = cleaned.slice(0, 32)
      updateDisplay()
      onInput?.(value)
    }
  }

  function preventDefault(e: Event) {
    e.preventDefault()
  }

  function handleMouseDown(e: MouseEvent) {
    e.preventDefault()
    if (contentEditableRef) {
      contentEditableRef.focus()
    }
  }

  export function focus(): void {
    contentEditableRef?.focus()
  }

  export function clear(): void {
    value = ''
    updateDisplay()
    onInput?.('')
  }

  export function isComplete(): boolean {
    return value.length === 32
  }

  $effect(() => {
    updateDisplay()
  })

  $effect(() => {
    if (autoFocus && contentEditableRef) {
      contentEditableRef.focus()
    }
  })
</script>

<div class='flex flex-col gap-2 font-mono'>
  <div
    bind:this={contentEditableRef}
    contenteditable
    oninput={preventDefault}
    onkeydown={handleKeydown}
    onkeypress={preventDefault}
    onpaste={handlePaste}
    onmousedown={handleMouseDown}
    onselectstart={preventDefault}
    class="card bg-base-100 border-2 transition-all duration-200 cursor-text min-h-[5rem] flex flex-col justify-center p-4 gap-3 outline-none select-none caret-transparent {formattedDisplay.complete ? 'border-success bg-success/5' : 'border-base-300 hover:border-base-content/20'} focus:border-primary focus:shadow-lg focus:shadow-primary/10"
    role='textbox'
    tabindex='0'
    style='caret-color: transparent;'
  >
    <div class='text-center'>
      <span class='md:text-2xl tracking-widest font-semibold text-base-content/40'></span>
    </div>
    <div class='text-center'>
      <span class='md:text-2xl tracking-widest font-semibold text-base-content/40'></span>
    </div>
  </div>
</div>
