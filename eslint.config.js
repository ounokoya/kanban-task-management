// Règles JavaScript vérifiées comme par les vérifications automatiques de FM (préréglage recommandé d'ESLint)
import js from '@eslint/js'
import globals from 'globals'

export default [
  { ignores: ['dist/', 'node_modules/', 'test-results/', 'playwright-report/', 'design/'] },
  js.configs.recommended,
  { files: ['src/**/*.js'], languageOptions: { globals: globals.browser } },
  { files: ['src/**/*.svelte.js'], languageOptions: { globals: { $state: 'readonly', $derived: 'readonly', $effect: 'readonly' } } },
  { files: ['tests/**/*.js', 'scripts/**/*.js', '*.config.js'], languageOptions: { globals: { ...globals.node, ...globals.browser } } },
]
