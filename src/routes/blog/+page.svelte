<script>
  import { filterAndSort, formatDate } from '$lib/posts.js';
  import { langPref } from '$lib/stores/lang.svelte.js';

  let { data } = $props();
  let { posts, frPosts } = $derived(data);
  let query = $state('');
  let sort = $state('newest');

  // Posts arrive already sorted newest-first from the load function, so the
  // prerendered page is correct before this ever runs.
  let available = $derived(langPref.value === 'fr' ? frPosts : posts);
  let shown = $derived(filterAndSort(available, { query, sort }));
</script>

<svelte:head>
  <title>Articles - bnei.dev</title>
</svelte:head>

<div class="mb-6 flex flex-wrap items-baseline justify-between gap-2">
  <h1 class="font-mono text-4xl font-extrabold tracking-tight">Latest Articles</h1>
  <a href="/blog/weekly" class="font-mono text-sm font-medium text-primary hover:underline"
    >Weekly rundowns &rarr;</a
  >
</div>

<div class="mb-10 flex flex-col gap-3 sm:flex-row">
  <input
    type="search"
    bind:value={query}
    placeholder="Search articles…"
    aria-label="Search articles"
    class="input font-mono sm:flex-1"
  />
  <select bind:value={sort} aria-label="Sort articles" class="select font-mono sm:w-56">
    <option value="newest">Newest first</option>
    <option value="oldest">Oldest first</option>
    <option value="title">Title A–Z</option>
  </select>
</div>

{#if shown.length === 0}
  <p class="font-mono text-base-content/70">
    {#if query.trim()}
      No articles match “{query}”.
    {:else}
      No French articles yet — check back soon.
    {/if}
  </p>
{/if}

<div class="grid gap-4">
  {#each shown as post (post.url)}
    <article class="group">
      <a
        href={post.url}
        class="block rounded-box border border-base-300 bg-base-200 p-6 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
      >
        <div class="mb-2 flex items-center gap-2 font-mono text-sm text-base-content/70">
          <span>{formatDate(post.metadata.date) || 'No date'}</span>
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
