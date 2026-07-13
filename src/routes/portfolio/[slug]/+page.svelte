<script>
  let { data } = $props();
  let { project } = $derived(data);
</script>

<svelte:head>
  <title>{project.metadata.title}</title>
</svelte:head>

<a
  href="/portfolio"
  class="mb-8 inline-flex items-center gap-1 font-mono text-sm font-medium text-base-content/60 transition-colors hover:text-primary"
>
  <span aria-hidden="true">&larr;</span> Back to portfolio
</a>

<header class="mb-10">
  <h1 class="mb-3 font-mono text-4xl font-extrabold tracking-tight">{project.metadata.title}</h1>
  <div class="flex gap-4 font-mono text-sm font-medium">
    {#if project.metadata.gitLink}
      <a href={project.metadata.gitLink} class="text-primary hover:underline">Source</a>
    {/if}
    {#if project.metadata.liveLink}
      <a href={project.metadata.liveLink} class="text-primary hover:underline">Live</a>
    {/if}
  </div>
</header>

<article class="prose prose-lg prose-a:text-primary mx-auto">
  {@html project.content}
</article>
