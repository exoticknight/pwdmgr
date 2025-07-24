import antfu from '@antfu/eslint-config'

export default antfu(
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
)
