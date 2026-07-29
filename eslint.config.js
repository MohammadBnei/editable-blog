import { defineConfig } from 'eslint/config';
import globals from 'globals';
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import prettier from 'eslint-config-prettier';
import svelteConfig from './svelte.config.js';

export default defineConfig([
  js.configs.recommended,
  svelte.configs.recommended,
  svelte.configs.prettier,
  prettier,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        ...globals.browser,
        ...globals.node
      }
    }
  },
  {
    files: ['server.js'],
    languageOptions: {
      globals: {
        Bun: 'readonly'
      }
    }
  },
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parserOptions: {
        svelteConfig
      }
    },
    rules: {
      // This site doesn't use SvelteKit's typed-routing resolve() helper anywhere
      // (all routes are plain static hrefs), so requiring it isn't a fit here.
      'svelte/no-navigation-without-resolve': 'off',
      // {@html} is used only to render markdown compiled at build time from
      // git-committed content files, never user input, so this isn't an XSS risk.
      'svelte/no-at-html-tags': 'off'
    }
  },
  {
    ignores: ['build/', '.svelte-kit/', 'static/', '.agents/', '.claude/']
  }
]);
