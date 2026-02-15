import antfu from '@antfu/eslint-config'

const config: ReturnType<typeof antfu> = antfu(
  {
    jsx: true,
    svelte: true,
    typescript: { tsconfigPath: './tsconfig.json' },
  },
  {
    ignores: [
      'cspell.config.yaml',
      'wailsjs/**',
      'dist/**',
      'build/**',
      'node_modules/**',
      '**/*.d.ts',
      '**/*.md',
    ],
  },
  {
    rules: {
      'ts/strict-boolean-expressions': 'off',
    },
  },
)

export default config
