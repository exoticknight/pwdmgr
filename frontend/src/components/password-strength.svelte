<script lang='ts'>
  import i18next from '../i18n'
  import { PasswordGenerator } from '../utils/password-generator'

  interface Props {
    password: string
    showDetails?: boolean
    alwaysShow?: boolean
  }

  const { password, showDetails = false, alwaysShow = false }: Props = $props()

  const strength = $derived(PasswordGenerator.checkStrength(password))

  // 根据强度分数确定激活的长条数量
  const activeBars = $derived(() => {
    const score = strength.score
    if (score <= 2) {
      return 1 // 危险：只有第一条（红色）
    }
    if (score <= 4) {
      return 2 // 警告：前两条（红色 + 橙色）
    }
    if (score <= 6) {
      return 3 // 良好：前三条（红色 + 橙色 + 蓝色）
    }
    return 4 // 安全：全部四条（红色 + 橙色 + 蓝色 + 绿色）
  })

  // 获取每个长条的样式类
  function getBarClass(barIndex: number): string {
    const isActive = barIndex < activeBars()

    if (!isActive) {
      return 'bar-inactive'
    }

    // 根据长条位置返回对应的颜色
    switch (barIndex) {
      case 0: return 'bar-danger' // 第一条：红色（危险）
      case 1: return 'bar-warning' // 第二条：橙色（警告）
      case 2: return 'bar-good' // 第三条：蓝色（良好）
      case 3: return 'bar-success' // 第四条：绿色（安全）
      default: return 'bar-inactive'
    }
  }
</script>

{#if alwaysShow || password}
  <div class='password-strength'>
    <div class='strength-bars'>
      <div class='strength-bar {getBarClass(0)}' title={i18next.t('passwordGenerator.strength.weak')}></div>
      <div class='strength-bar {getBarClass(1)}' title={i18next.t('passwordGenerator.strength.fair')}></div>
      <div class='strength-bar {getBarClass(2)}' title={i18next.t('passwordGenerator.strength.good')}></div>
      <div class='strength-bar {getBarClass(3)}' title={i18next.t('passwordGenerator.strength.strong')}></div>
    </div>
    <div class='strength-info'>
      <span class='strength-text strength-{strength.strength}'>
        {i18next.t(`passwordGenerator.strength.${strength.strength}`)}
      </span>
      <span class='strength-score'>
        {strength.score}/7
      </span>
    </div>
    {#if showDetails && strength.feedback.length > 0}
      <div class='strength-feedback'>
        {#each strength.feedback as feedback}
          <div class='feedback-item'>
            {feedback}
          </div>
        {/each}
      </div>
    {/if}
  </div>
{/if}

<style>
  .password-strength {
    margin-top: 0.5rem;
  }

  .strength-bars {
    display: flex;
    gap: 3px;
    margin-bottom: 0.5rem;
  }

  .strength-bar {
    flex: 1;
    height: 4px;
    border-radius: 2px;
    transition: background-color 0.3s ease;
  }

  .bar-inactive {
    background: var(--color-border-light);
  }

  .bar-danger {
    background: var(--color-danger);
  }

  .bar-warning {
    background: var(--color-warning);
  }

  .bar-good {
    background: #17a2b8;
  }

  .bar-success {
    background: var(--color-success);
  }

  .strength-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.75rem;
  }

  .strength-text {
    font-weight: 500;
  }

  .strength-text.strength-weak {
    color: var(--color-danger);
  }

  .strength-text.strength-fair {
    color: var(--color-warning);
  }

  .strength-text.strength-good {
    color: #17a2b8;
  }

  .strength-text.strength-strong {
    color: var(--color-success);
  }

  .strength-score {
    color: var(--color-text-muted);
  }

  .strength-feedback {
    margin-top: 0.5rem;
    padding: 0.5rem;
    background: var(--color-bg-secondary);
    border-radius: 4px;
    font-size: 0.75rem;
  }

  .feedback-item {
    margin-bottom: 0.25rem;
    color: var(--color-text-secondary);
  }

  .feedback-item:last-child {
    margin-bottom: 0;
  }
</style>
