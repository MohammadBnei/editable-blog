<script>
  export let data;
  const { page } = data;
</script>

<svelte:head>
  <title>{page.metadata.title}</title>
</svelte:head>

<article class="prose prose-lg dark:prose-invert prose-a:text-blue-600 max-w-none">
  <h1 class="mb-4 text-4xl font-extrabold tracking-tight not-prose">{page.metadata.title}</h1>
  {#if page.metadata.download}
    <a
      href={page.metadata.download}
      class="not-prose mb-10 inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
    >
      Download PDF
    </a>
  {/if}
  {@html page.content}
</article>
