<script lang='ts'>
  import { Lock } from '@lucide/svelte'

  import { autoLock } from '@/stores/auto-lock.svelte'
  import { i18n } from '@/stores/i18n.svelte'

  let password = $state('')
  let error = $state('')
  let input = $state<HTMLInputElement>()

  $effect(() => {
    if (autoLock.shouldLock && input) {
      setTimeout(() => input?.focus(), 100)
    }
  })

  async function handleSubmit(event: Event) {
    event.preventDefault()
    try {
      await autoLock.unlock(password)
      password = ''
      error = ''
    }
    catch {
      password = ''
      error = i18n.t('autoLock.incorrectPassword')
      setTimeout(() => input?.focus(), 100)
    }
  }

  function clearError() {
    error = ''
  }
</script>

{#if autoLock.isLocked}
  <div class='lock-overlay'>
    <div class='card card-compact w-96 bg-base-100 shadow-2xl'>
      <div class='card-body'>
        <div class='text-center'>
          <div class='mb-4'>
            <Lock class='w-16 h-16 mx-auto text-primary' />
          </div>

          <h2 class='card-title text-xl mb-2 justify-center'>
            {i18n.t('autoLock.title')}
          </h2>

          <p class='text-base-content/70 mb-6'>
            {i18n.t('autoLock.message')}
          </p>
        </div>

        <form onsubmit={handleSubmit} class='space-y-4'>
          <div class='form-control'>
            <label class='label' for='unlock-password'>
              <span class='label-text'>{i18n.t('password.label')}</span>
            </label>
            <input
              id='unlock-password'
              bind:value={password}
              bind:this={input}
              type='password'
              placeholder={i18n.t('password.placeholder')}
              class='input input-bordered w-full'
              class:input-error={error}
              oninput={clearError}
            />
            {#if error}
              <label class='label' for="">
                <span class='label-text-alt text-error'>{error}</span>
              </label>
            {/if}
          </div>

          <div class='card-actions justify-center'>
            <button
              type='submit'
              class='btn btn-primary btn-wide'
              disabled={!password.trim()}
            >
              {i18n.t('autoLock.unlock')}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
{/if}

<style>
.lock-overlay {
  position: fixed;
  inset: 0;
  background: oklch(0 0 0 / 0.8);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: grid;
  place-items: center;
}
</style>
