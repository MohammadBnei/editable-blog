import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import path from 'path';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import { getTagRoutes } from './scripts/get-tag-routes.js';

// Get dynamic tag routes
const tagRoutes = getTagRoutes();

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: ['.svelte', '.mdx'],

  preprocess: [
    vitePreprocess(),
    mdsvex({
      extensions: ['.mdx'],
      remarkPlugins: [remarkGfm],
      rehypePlugins: [rehypeSlug]
    })
  ],
  kit: {
    // Static site generator
    adapter: adapter({
      // Static site output folder
      pages: 'build',
      assets: 'build',
      // No fallback: every route here is prerenderable, so `strict: true`
      // fails the build loudly if that ever stops being true, instead of
      // silently overwriting a prerendered page with an empty SPA shell.
      precompress: false,
      strict: true
    }),

    // Custom alias defined to handle the content folder
    alias: {
      $content: path.resolve('./content'),
      $lib: path.resolve('./src/lib'),
      'statue-ssg': path.resolve('./src/lib')
    },

    // Static site pre-processing options
    prerender: {
      crawl: true,
      entries: ['*', ...tagRoutes],
      handleHttpError: 'warn'
    }
  }
};

export default config;
