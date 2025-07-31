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

  // Determine number of active bars based on strength score
  const activeBars = $derived(() => {
    const score = strength.score
    if (score <= 2) {
      return 1 // Danger: only first bar (red)
    }
    if (score <= 4) {
      return 2 // Warning: first two bars (red + orange)
    }
    if (score <= 6) {
      return 3 // Good: first three bars (red + orange + blue)
    }
    return 4 // Safe: all four bars (red + orange + blue + green)
  })

  function getBarClass(barIndex: number): string {
    const isActive = barIndex < activeBars()

    if (!isActive) {
      return 'bar-inactive'
    }

    // Return corresponding color based on bar position
    switch (barIndex) {
      case 0: return 'bar-danger' // First bar: red (danger)
      case 1: return 'bar-warning' // Second bar: orange (warning)
      case 2: return 'bar-good' // Third bar: blue (good)
      case 3: return 'bar-success' // Fourth bar: green (safe)
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
