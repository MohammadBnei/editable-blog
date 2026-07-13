<script>
  export let data;
  const { project } = data;
</script>

<svelte:head>
  <title>{project.metadata.title}</title>
</svelte:head>

<a
  href="/portfolio"
  class="mb-8 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
>
  <span aria-hidden="true">&larr;</span> Back to portfolio
</a>

<article class="prose prose-lg dark:prose-invert prose-a:text-blue-600 max-w-none">
  <header class="mb-10 not-prose">
    <h1 class="mb-3 text-4xl font-extrabold tracking-tight">{project.metadata.title}</h1>
    <div class="flex gap-4 text-sm font-medium">
      {#if project.metadata.gitLink}
        <a href={project.metadata.gitLink} class="text-blue-600 hover:underline">Source</a>
      {/if}
      {#if project.metadata.liveLink}
        <a href={project.metadata.liveLink} class="text-blue-600 hover:underline">Live</a>
      {/if}
    </div>
  </header>

  {@html project.content}
</article>
