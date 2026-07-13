import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import path from 'path';

export default defineConfig({
  plugins: [sveltekit()],

  resolve: {
    alias: {
      $content: path.resolve('content'),
      $cms: path.resolve('src/lib/cms')
    }
  },

  server: {
    port: 3000
  }
});
