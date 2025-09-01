<script lang='ts'>
  import type { LanguageCode } from '@/types/setting'
  import { Globe } from '@lucide/svelte'
  import { LANGUAGES } from '@/consts/languages'
  import { i18n } from '@/stores/i18n.svelte'

  const lng = $derived.by(() => LANGUAGES.find(lang => lang.code === i18n.currentLanguage)?.name)

  function handleLanguageChange(languageCode: LanguageCode) {
    i18n.changeLanguage(languageCode)
  }
</script>

<div class='language-selector'>
  <div class='dropdown dropdown-top dropdown-end'>
    <button tabindex='0' class='btn btn-outline'>
      <Globe size={16} />
      <span>{lng}</span>
    </button>
    <ul class='dropdown-content menu bg-base-100 shadow-lg border border-base-300 rounded-lg z-50 min-w-32'>
      {#each LANGUAGES as language}
        <li>
          <button
            class:active={language.code === i18n.currentLanguage}
            onclick={() => handleLanguageChange(language.code)}
          >
            {language.name}
          </button>
        </li>
      {/each}
    </ul>
  </div>
</div>

<style>
  .language-selector {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 50;
  }
</style>
