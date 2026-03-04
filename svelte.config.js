import adapter from 'svelte-adapter-bun';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter({
			precompress: true 
		}),
		experimental: {
			remoteFunctions: true
		},
    csrf: {
      trustedOrigins: ['https://bnei.dev', 'https://blog.bnei.dev', 'http://localhost:5173']
    }
  },
  experimental: {
		async: true
	},
	build: {
		rollupOptions: {
			external: ['@sveltejs/kit/*']
		}
	},
  preprocess: vitePreprocess()
};

export default config;
