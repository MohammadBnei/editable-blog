<script>
  export let data;
  const { posts } = data;
</script>

<svelte:head>
  <title>Articles - bnei.dev</title>
</svelte:head>

<h1 class="mb-10 text-4xl font-extrabold tracking-tight">Latest Articles</h1>

<div class="grid gap-4">
  {#each posts as post}
    <article class="group">
      <a
        href={post.url}
        class="block rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg hover:shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-800 dark:hover:shadow-none"
      >
        <div class="mb-2 text-sm text-slate-400 dark:text-slate-500">
          {post.metadata.date || 'No date'}
        </div>
        <h2 class="mb-2 text-2xl font-bold transition-colors group-hover:text-blue-600">
          {post.metadata.title}
        </h2>
        <p class="leading-relaxed text-slate-600 dark:text-slate-400">
          {post.metadata.description}
        </p>
      </a>
    </article>
  {/each}
</div>
