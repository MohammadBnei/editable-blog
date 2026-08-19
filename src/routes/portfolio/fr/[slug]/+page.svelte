<script>
  import Project from '$lib/components/Project.svelte';

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
  <span aria-hidden="true">&larr;</span> Retour au portfolio
</a>

<Project {project} lang="fr" />
