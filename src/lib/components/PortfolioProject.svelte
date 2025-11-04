<script>
  import PlainText from '$lib/components/PlainText.svelte';
  import RichText from '$lib/components/RichText.svelte';
  import SecondaryButton from '$lib/components/SecondaryButton.svelte';
  import { isEditing } from '$lib/stores.js';
  import { extractTeaser } from '$lib/util';

  let { project, index, onRemove, onToggleExpand, generateSlug } = $props();

  let expanded = $state(project.expanded || false);

  function handleToggleExpand() {
    expanded = !expanded;
    if (onToggleExpand) {
      onToggleExpand(index);
    }
  }

  function handleRemove() {
    if (onRemove) {
      onRemove(index);
    }
  }

  function handleTitleInput() {
    project.slug = generateSlug(project.title);
  }
</script>

<div class="border rounded-lg p-6 shadow-md mb-6">
  {#if $isEditing}
    <div class="mb-4">
      <label for="project-title-{index}" class="block text-sm font-medium text-gray-700">Project Title</label>
      <PlainText
        id="project-title-{index}"
        bind:content={project.title}
        on:input={handleTitleInput}
        class="mt-1 block w-full"
      />
    </div>
    <div class="mb-4">
      <label for="project-slug-{index}" class="block text-sm font-medium text-gray-700">Project Slug</label>
      <PlainText id="project-slug-{index}" bind:content={project.slug} class="mt-1 block w-full" />
    </div>
    <div class="mb-4">
      <label for="project-git-{index}" class="block text-sm font-medium text-gray-700">GitHub Link</label>
      <PlainText id="project-git-{index}" bind:content={project.gitLink} class="mt-1 block w-full" />
    </div>
    <div class="mb-4">
      <label for="project-live-{index}" class="block text-sm font-medium text-gray-700">Live Demo Link</label>
      <PlainText id="project-live-{index}" bind:content={project.liveLink} class="mt-1 block w-full" />
    </div>
  {:else}
    <h2 class="text-2xl font-semibold mb-2">
      <a href="/portfolio/{project.slug}" class="hover:underline">{project.title}</a>
    </h2>
  {/if}

  <div class="flex justify-end align-middle">
    <SecondaryButton size="sm" on:click={handleToggleExpand}>
      {expanded || $isEditing ? 'Collapse' : 'Expand'}
    </SecondaryButton>
  </div>
  <div class="prose mb-4">
    {#if expanded || $isEditing}
      <RichText multiLine bind:content={project.content} />
    {:else}
      <RichText multiLine content={extractTeaser(project.content, 100)} />
    {/if}
  </div>

  {#if $isEditing}
    <SecondaryButton on:click={handleRemove} size="sm">Remove Project</SecondaryButton>
  {/if}
</div>
