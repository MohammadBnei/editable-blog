<script>
  import { langPref } from '$lib/stores/lang.svelte.js';

  let { data } = $props();
  let { posts, frPosts } = $derived(data);
  let shown = $derived(langPref.value === 'fr' ? frPosts : posts);
</script>

<svelte:head>
  <title>Articles - bnei.dev</title>
</svelte:head>

<h1 class="mb-10 font-mono text-4xl font-extrabold tracking-tight">Latest Articles</h1>

{#if shown.length === 0}
  <p class="font-mono text-base-content/70">No French articles yet — check back soon.</p>
{/if}

<div class="grid gap-4">
  {#each shown as post (post.url)}
    <article class="group">
      <a
        href={post.url}
        class="block rounded-box border border-base-300 bg-base-200 p-6 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
      >
        <div class="mb-2 flex items-center gap-2 font-mono text-sm text-base-content/70">
          <span>{post.metadata.date || 'No date'}</span>
          {#if post.metadata.format === 'interview'}
            <span
              class="rounded-field border border-primary/40 px-1.5 py-0.5 text-[0.65rem] uppercase tracking-wide text-primary"
              >Q&amp;A</span
            >
          {/if}
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
