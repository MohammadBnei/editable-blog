<script lang="ts">
  import type { PageProps } from './$types';
  import Project from '$lib/components/Project.svelte';

  let { data }: PageProps = $props();
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

<Project {project} />
