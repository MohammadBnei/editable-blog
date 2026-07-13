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
      // Every route here is prerenderable, so `strict: true` fails the
      // build loudly if that ever stops being true, instead of silently
      // overwriting a prerendered page with an empty SPA shell. `fallback`
      // is unrelated to that check (it only guards non-prerenderable
      // routes) — it just gives `serve`/static hosts a 404.html to serve
      // for any path with no prerendered file, which then renders our
      // +error.svelte client-side.
      precompress: false,
      strict: true,
      fallback: '404.html'
    }),

    // Custom alias defined to handle the content folder
    alias: {
      $content: path.resolve('./content'),
      $lib: path.resolve('./src/lib')
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
