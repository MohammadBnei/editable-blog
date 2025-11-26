<script>
  import PlainText from '$lib/components/PlainText.svelte';
  import RichText from '$lib/components/RichText.svelte';
  import { isEditing } from '$lib/stores.js';
  import { extractTeaser } from '$lib/util';

  let { project = $bindable(), index, onRemove, onToggleExpand, generateSlug } = $props();

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

  // Reactive statement to update slug when title changes
  $effect(() => {
    if (project.title) {
      project.slug = generateSlug(project.title);
    }
  });
</script>

<div class="card bg-base-100 shadow-xl mb-6">
  <div class="card-body">
    {#if $isEditing}
      <div class="mb-4">
        <label class="form-control w-full">
          <div class="label">
            <span class="label-text">Project Title</span>
          </div>
          <PlainText
            id="project-title-{index}"
            bind:content={project.title}
            class="input input-bordered w-full"
          />
        </label>
      </div>
      <div class="mb-4">
        <label class="form-control w-full">
          <div class="label">
            <span class="label-text">Project Slug</span>
          </div>
          <PlainText
            id="project-slug-{index}"
            bind:content={project.slug}
            class="input input-bordered w-full"
          />
        </label>
      </div>
      <div class="mb-4">
        <label class="form-control w-full">
          <div class="label">
            <span class="label-text">GitHub Link</span>
          </div>
          <PlainText
            id="project-git-{index}"
            bind:content={project.gitLink}
            class="input input-bordered w-full"
          />
        </label>
      </div>
      <div class="mb-4">
        <label class="form-control w-full">
          <div class="label">
            <span class="label-text">Live Demo Link</span>
          </div>
          <PlainText
            id="project-live-{index}"
            bind:content={project.liveLink}
            class="input input-bordered w-full"
          />
        </label>
      </div>
    {:else}
      <div class="flex items-center justify-between mb-2">
        <h2 class="card-title">
          <a href="/portfolio/{project.slug}" class="hover:underline">{project.title}</a>
        </h2>
        <button class="btn btn-sm btn-secondary" on:click={handleToggleExpand}>
          {expanded ? 'Collapse' : 'Expand'}
        </button>
      </div>
    {/if}

    <div class="prose max-w-full">
      {#if expanded || $isEditing}
        <RichText multiLine bind:content={project.content} />
      {:else}
        <RichText multiLine content={extractTeaser(project.content, 100)} />
      {/if}
    </div>

    {#if $isEditing}
      <div class="card-actions justify-end">
        <button class="btn btn-sm btn-error" on:click={handleRemove}>Remove Project</button>
      </div>
    {/if}
  </div>
</div>
