<script>
  import { formatDate } from '$lib/posts.js';

  let { data } = $props();
  let { posts } = $derived(data);
</script>

<svelte:head>
  <title>LinkedIn drafts - bnei.dev</title>
</svelte:head>

<h1 class="mb-2 font-mono text-4xl font-extrabold tracking-tight">LinkedIn drafts</h1>
<p class="mb-10 leading-relaxed text-base-content/70">
  Short versions of posts, written to be pasted. Not linked from anywhere public and excluded from
  the feed, the sitemap and the search index — but they are prerendered into the image like every
  other page, so treat the gate as the only thing keeping them private.
</p>

{#if posts.length === 0}
  <p class="font-mono text-base-content/70">No drafts yet.</p>
{/if}

<div class="grid gap-4">
  {#each posts as post (post.url)}
    <article class="group">
      <a
        href={post.url}
        class="block rounded-box border border-base-300 bg-base-200 p-6 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
      >
        <div class="mb-2 font-mono text-sm text-base-content/70">
          {formatDate(post.metadata.date) || 'No date'}
        </div>
        <h2 class="mb-2 text-2xl font-bold transition-colors group-hover:text-primary">
          {post.metadata.title}
        </h2>
        <p class="leading-relaxed text-base-content/70">
          {post.metadata.description}
        </p>
      </a>
    </article>
  {/each}
</div>
