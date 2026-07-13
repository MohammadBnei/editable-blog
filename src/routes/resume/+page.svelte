<script>
  let { data } = $props();
  let { page } = $derived(data);
</script>

<svelte:head>
  <title>{page.metadata.title}</title>
</svelte:head>

<h1 class="mb-4 font-mono text-4xl font-extrabold tracking-tight">
  {page.metadata.title}
</h1>
{#if page.metadata.download}
  <a href={page.metadata.download} class="btn btn-primary rounded-field mb-10"> Download PDF </a>
{/if}

<article class="prose prose-lg prose-a:text-primary mx-auto">
  {@html page.content}
</article>
