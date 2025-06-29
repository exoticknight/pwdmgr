<script lang='ts'>
  import i18next from '../i18n'

  interface Props {
    hasUnsavedChanges: boolean
    onBack?: () => void
    onNew?: () => void
    onSave?: () => void
  }

  const { hasUnsavedChanges, onBack, onNew, onSave }: Props = $props()

  function handleBack() {
    onBack?.()
  }

  function handleNew() {
    onNew?.()
  }

  function handleSave() {
    onSave?.()
  }
</script>

<div class='p-4 border-b flex items-center justify-between'>
  <!-- Left side - Back and Save -->
  <div class='flex items-center gap-3'>
    <button
      class='btn btn-ghost btn-sm'
      onclick={handleBack}
      title={i18next.t('common.back')}
    >
      ←
    </button>

    <button
      class='btn btn-sm {hasUnsavedChanges ? 'btn-warning' : 'btn-ghost'}'
      onclick={handleSave}
      disabled={!hasUnsavedChanges}
      title={i18next.t('forms.save')}
    >
      💾
    </button>
  </div>

  <!-- Right side - Add New -->
  <button
    class='btn btn-primary btn-sm'
    onclick={handleNew}
    title={i18next.t('forms.addEntry')}
  >
    ➕
  </button>
</div>
