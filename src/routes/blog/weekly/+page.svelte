<script>
  import { formatDate } from '$lib/posts.js';

  let { data } = $props();
  let { rundowns } = $derived(data);
</script>

<svelte:head>
  <title>Weekly rundowns - bnei.dev</title>
</svelte:head>

<a
  href="/blog"
  class="mb-8 inline-flex items-center gap-1 font-mono text-sm font-medium text-base-content/60 transition-colors hover:text-primary"
>
  <span aria-hidden="true">&larr;</span> Back to articles
</a>

<h1 class="mb-2 font-mono text-4xl font-extrabold tracking-tight">Weekly rundowns</h1>
<p class="mb-10 leading-relaxed text-base-content/70">
  What actually shipped each week, written by the agent that watches the repos — including the
  things that stalled.
</p>

{#if rundowns.length === 0}
  <p class="font-mono text-base-content/70">No rundowns yet.</p>
{/if}

<div class="grid gap-4">
  {#each rundowns as rundown (rundown.url)}
    <article class="group">
      <a
        href={rundown.url}
        class="block rounded-box border border-base-300 bg-base-200 p-6 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
      >
        <div class="mb-2 font-mono text-sm text-base-content/70">
          {formatDate(rundown.metadata.date) || 'No date'}
        </div>
        <h2 class="mb-2 text-2xl font-bold transition-colors group-hover:text-primary">
          {rundown.metadata.title}
        </h2>
        <p class="leading-relaxed text-base-content/70">
          {rundown.metadata.description}
        </p>
      </a>
    </article>
  {/each}
</div>
