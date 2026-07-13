<script>
  let { data } = $props();
  let { projects, intro } = $derived(data);
</script>

<svelte:head>
  <title>{intro?.metadata?.title || 'Portfolio'}</title>
</svelte:head>

<h1 class="mb-4 font-mono text-4xl font-extrabold tracking-tight">
  {intro?.metadata?.title || 'Portfolio'}
</h1>

{#if intro}
  <div class="prose mb-10 mx-auto">
    {@html intro.content}
  </div>
{/if}

<div class="grid gap-4">
  {#each projects as project (project.url)}
    <article class="group">
      <a
        href={project.url}
        class="block rounded-box border border-base-300 bg-base-200 p-6 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
      >
        <h2 class="mb-2 text-2xl font-bold transition-colors group-hover:text-primary">
          {project.metadata.title}
        </h2>
        <p class="leading-relaxed text-base-content/70">
          {project.metadata.description}
        </p>
      </a>
    </article>
  {/each}
</div>
