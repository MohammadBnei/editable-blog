<script>
  export let data;
  const { projects, intro } = data;
</script>

<svelte:head>
  <title>{intro?.metadata?.title || 'Portfolio'}</title>
</svelte:head>

<h1 class="mb-4 text-4xl font-extrabold tracking-tight">{intro?.metadata?.title || 'Portfolio'}</h1>

{#if intro}
  <div class="prose dark:prose-invert mb-10 max-w-none">
    {@html intro.content}
  </div>
{/if}

<div class="grid gap-4">
  {#each projects as project}
    <article class="group">
      <a
        href={project.url}
        class="block rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg hover:shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-800 dark:hover:shadow-none"
      >
        <h2 class="mb-2 text-2xl font-bold transition-colors group-hover:text-blue-600">
          {project.metadata.title}
        </h2>
        <p class="leading-relaxed text-slate-600 dark:text-slate-400">
          {project.metadata.description}
        </p>
      </a>
    </article>
  {/each}
</div>
