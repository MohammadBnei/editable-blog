<script>
  import { formatDate } from '$lib/posts.js';
  import { hasMermaid, hydrateMermaid } from '$lib/mermaid.js';

  let { project, lang = 'en' } = $props();

  // The only translated UI strings in the portfolio. Everything else on the
  // page comes from the markdown file, which already exists per language.
  const LABELS = {
    en: {
      source: 'Source',
      live: 'Live',
      writeup: 'Write-up',
      active: 'Active',
      archived: 'Archived'
    },
    fr: {
      source: 'Code',
      live: 'En ligne',
      writeup: 'Article',
      active: 'Actif',
      archived: 'Archivé'
    }
  };

  let t = $derived(LABELS[lang] ?? LABELS.en);
  let meta = $derived(project.metadata);
  let archived = $derived(meta.status === 'archived');

  $effect(() => {
    if (!hasMermaid(project.content)) return;
    return hydrateMermaid();
  });
</script>

<header class="mb-10">
  <div class="mb-3 flex items-center gap-2 font-mono text-sm text-base-content/70">
    <span>{formatDate(meta.date)}</span>
    <span
      class="badge badge-sm font-mono uppercase tracking-wide {archived
        ? 'badge-dash border-base-300 text-base-content/50'
        : 'badge-outline border-primary/40 text-primary'}"
    >
      {archived ? t.archived : t.active}
    </span>
  </div>

  <h1 class="mb-3 font-mono text-4xl font-extrabold tracking-tight">{meta.title}</h1>

  {#if meta.stack?.length}
    <ul class="mb-4 flex flex-wrap gap-1.5">
      {#each meta.stack as tech (tech)}
        <li class="badge badge-sm badge-ghost font-mono text-base-content/60">{tech}</li>
      {/each}
    </ul>
  {/if}

  <div class="flex flex-wrap gap-4 font-mono text-sm font-medium">
    {#if meta.gitLink}
      <a href={meta.gitLink} class="text-primary hover:underline">{t.source}</a>
    {/if}
    {#if meta.liveLink}
      <a href={meta.liveLink} class="text-primary hover:underline">{t.live}</a>
    {/if}
    {#if meta.writeup}
      <a href={meta.writeup} class="text-primary hover:underline"
        >{t.writeup} <span aria-hidden="true">&rarr;</span></a
      >
    {/if}
  </div>
</header>

<article class="prose prose-lg prose-a:text-primary mx-auto">
  {@html project.content}
</article>
