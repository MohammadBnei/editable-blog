<script lang="ts">
  import type { PageProps } from './$types';
  import BlogPost from '$lib/components/BlogPost.svelte';

  let { data }: PageProps = $props();
  let { post } = $derived(data);
</script>

<svelte:head>
  <title>{post.metadata.title}</title>
</svelte:head>

<a
  href="/blog"
  class="mb-8 inline-flex items-center gap-1 font-mono text-sm font-medium text-base-content/60 transition-colors hover:text-primary"
>
  <span aria-hidden="true">&larr;</span> Back to articles
</a>

<BlogPost {post} />
