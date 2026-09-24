import js from '@eslint/js'
import globals from 'globals'

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
      },
    },
  },
  {
    files: ['src/__tests__/**/*.js', 'vite.config.js'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    // commitlint.config.cjs等はdev-standards submoduleへのsymlinkであり、
    // このプロジェクトのコード品質チェック対象ではない。CIのpackage-testジョブは
    // submoduleを取得しない（enable_standards_check未使用）ため、これらを
    // lint対象に含めるとsymlinkのリンク切れでESLintがENOENTで落ちる。
    ignores: [
      'dist/**',
      'dev-standards/**',
      'commitlint.config.cjs',
      'stylelint.config.cjs',
      'textlint.config.cjs',
      'dependency-cruiser.config.cjs',
      'textlint-rules/**',
    ],
  },
]
