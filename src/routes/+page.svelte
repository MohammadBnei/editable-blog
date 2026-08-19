<script>
  import { formatDate } from '$lib/posts.js';

  let { data } = $props();
  let { latestPost } = $derived(data);
</script>

<svelte:head>
  <title>bnei.dev</title>
</svelte:head>

<section class="grid gap-12 py-16 sm:py-24 lg:grid-cols-2 lg:items-center">
  <div>
    <p class="mb-4 font-mono text-sm font-semibold uppercase tracking-widest text-primary">Hello</p>
    <h1 class="mb-6 font-mono text-5xl font-extrabold tracking-tight sm:text-6xl">
      I'm Mohammad-Amine.
    </h1>
    <p class="mb-10 max-w-xl text-xl leading-relaxed text-base-content/70">
      I write about code and life, in English and French.
    </p>

    <div class="flex flex-wrap gap-3">
      <a href="/blog" class="btn btn-primary rounded-field gap-2">
        Read my posts
        <span aria-hidden="true">&rarr;</span>
      </a>
      <a href="/portfolio" class="btn btn-outline rounded-field gap-2">
        See my work
        <span aria-hidden="true">&rarr;</span>
      </a>
    </div>
  </div>

  {#if latestPost}
    <div class="rounded-box border border-base-300 bg-base-200 p-6 font-mono text-sm shadow-sm">
      <div class="mb-4 flex gap-1.5">
        <span class="h-3 w-3 rounded-full bg-base-300"></span>
        <span class="h-3 w-3 rounded-full bg-base-300"></span>
        <span class="h-3 w-3 rounded-full bg-base-300"></span>
      </div>
      <div class="text-primary">$ latest_post --show</div>
      <div class="mt-3 text-base-content/70">{formatDate(latestPost.metadata.date)}</div>
      <a
        href={latestPost.url}
        class="mt-1 block text-base-content transition-colors hover:text-primary"
      >
        {latestPost.metadata.title}
      </a>
    </div>
  {/if}
</section>
