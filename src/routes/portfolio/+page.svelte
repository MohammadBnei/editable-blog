<script>
  import { formatDate } from '$lib/posts.js';
  import { langPref } from '$lib/stores/lang.svelte.js';

  let { data } = $props();
  let { projects, frProjects, intro, frIntro } = $derived(data);

  // Both lists arrive sorted newest-first from the load function, so the
  // prerendered page is correct before this ever runs.
  let fr = $derived(langPref.value === 'fr');
  let shown = $derived(fr ? frProjects : projects);
  let page = $derived((fr && frIntro) || intro);
</script>

<svelte:head>
  <title>{page?.metadata?.title || 'Portfolio'}</title>
</svelte:head>

<h1 class="mb-4 font-mono text-4xl font-extrabold tracking-tight">
  {page?.metadata?.title || 'Portfolio'}
</h1>

{#if page}
  <div class="prose mb-10 mx-auto">
    {@html page.content}
  </div>
{/if}

{#if shown.length === 0 && fr}
  <p class="font-mono text-base-content/70">Aucun projet en français pour le moment.</p>
{/if}

<div class="grid gap-4">
  {#each shown as project (project.url)}
    <article class="group">
      <a
        href={project.url}
        class="block rounded-box border border-base-300 bg-base-200 p-6 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
      >
        <div class="mb-2 flex items-center gap-2 font-mono text-sm text-base-content/70">
          <span>{formatDate(project.metadata.date)}</span>
          {#if project.metadata.status === 'archived'}
            <span
              class="badge badge-sm badge-dash border-base-300 font-mono uppercase tracking-wide text-base-content/50"
              >{fr ? 'Archivé' : 'Archived'}</span
            >
          {:else}
            <span
              class="badge badge-sm badge-outline border-primary/40 font-mono uppercase tracking-wide text-primary"
              >{fr ? 'Actif' : 'Active'}</span
            >
          {/if}
        </div>
        <h2 class="mb-2 text-2xl font-bold transition-colors group-hover:text-primary">
          {project.metadata.title}
        </h2>
        <p class="mb-3 leading-relaxed text-base-content/70">
          {project.metadata.description}
        </p>
        {#if project.metadata.stack?.length}
          <ul class="flex flex-wrap gap-1.5">
            {#each project.metadata.stack as tech (tech)}
              <li class="badge badge-sm badge-ghost font-mono text-base-content/60">{tech}</li>
            {/each}
          </ul>
        {/if}
      </a>
    </article>
  {/each}
</div>
