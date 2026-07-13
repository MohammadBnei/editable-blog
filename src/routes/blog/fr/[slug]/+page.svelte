<script>
  export let data;
  const { post } = data;
</script>

<svelte:head>
  <title>{post.metadata.title}</title>
</svelte:head>

<a
  href="/blog"
  class="mb-8 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
>
  <span aria-hidden="true">&larr;</span> Back to articles
</a>

<article class="prose prose-lg dark:prose-invert prose-a:text-blue-600 max-w-none">
  <header class="mb-10 not-prose">
    <h1 class="mb-2 text-4xl font-extrabold tracking-tight">{post.metadata.title}</h1>
    <div class="text-slate-400 dark:text-slate-500">{post.metadata.date}</div>
  </header>

  {@html post.content}
</article>
