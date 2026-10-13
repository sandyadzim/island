import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import astro from 'eslint-plugin-astro';
import prettier from 'eslint-config-prettier/flat';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores([
    'dist/**',
    '.astro/**',
    '.qa/**',
    '.impeccable/**',
    'public/**',
  ]),
  {
    files: ['**/*.{js,mjs,cjs,ts,astro}'],
    extends: [js.configs.recommended],
  },
  {
    files: ['**/*.ts', '**/*.astro'],
    extends: [tseslint.configs.recommended],
  },
  ...astro.configs.recommended,
  {
    files: ['src/**/*.{ts,astro}'],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['**/*.{js,mjs,cjs}', 'tests/**/*.ts'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['tests/browser/**/*.mjs'],
    languageOptions: { globals: globals.browser },
    // Browser probes can continue when optional localStorage is unavailable.
    rules: { 'no-empty': ['error', { allowEmptyCatch: true }] },
  },
  // Keep formatting in Prettier and disable conflicting lint rules.
  prettier,
]);
