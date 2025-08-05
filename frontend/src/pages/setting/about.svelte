<script lang='ts'>
  import { VERSION } from '@/consts/version'
  import { i18n } from '@/stores/i18n.svelte'
  import SettingItem from './setting-item.svelte'
  import SettingSection from './setting-section.svelte'
</script>

<SettingSection title={i18n.t('setting.about.title')}>
  {#snippet items()}
    <SettingItem
      title={i18n.t('setting.about.version')}
    >
      {#snippet control()}
        <div class='text-base-content'>{VERSION}</div>
      {/snippet}
    </SettingItem>
  {/snippet}
</SettingSection>
