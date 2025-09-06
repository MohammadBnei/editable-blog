<script>
  import Footer from '$lib/components/Footer.svelte';
  import PlainText from '$lib/components/PlainText.svelte';
  import RichText from '$lib/components/RichText.svelte';
  import LoginMenu from '$lib/components/LoginMenu.svelte';
  import PrimaryButton from '$lib/components/PrimaryButton.svelte';
  import { fetchJSON } from '$lib/util';
  import { extractTeaser } from '$lib/util';
  import { currentUser, isEditing } from '$lib/stores.js';
  import WebsiteHeader from '$lib/components/WebsiteHeader.svelte';

  let { data } = $props();

  let showUserMenu = $state(false);
  let title = $derived(data.page?.title || 'My Portfolio');
  let introContent = $derived(data.page?.introContent || ''); // Optional intro text for the page
  let projects = $state(data.page?.projects || []); // Array of projects, each with title, content (markdown), gitLink, liveLink

  $currentUser = data.currentUser;

  function toggleEdit() {
    $isEditing = true;
    showUserMenu = false;
  }

  function addProject() {
    projects.push({ title: '', content: '', gitLink: '', liveLink: '', expanded: false });
    projects = [...projects]; // Trigger reactivity
  }

  function removeProject(index) {
    projects.splice(index, 1);
    projects = [...projects]; // Trigger reactivity
  }

  function toggleProject(index) {
    projects[index].expanded = !projects[index].expanded;
    projects = [...projects]; // Trigger reactivity
  }

  async function savePage() {
    if (!$currentUser) return alert('Sorry, you are not authorized.');
    try {
      await fetchJSON('POST', '/api/save-page', {
        pageId: 'portfolio',
        page: {
          title,
          introContent,
          projects
        }
      });
      $isEditing = false;
    } catch (err) {
      console.error(err);
      alert('There was an error. Please try again.');
    }
  }
</script>

<svelte:head>
  <title>Portfolio</title>
</svelte:head>

<WebsiteHeader bind:showUserMenu save={savePage}>
  <PrimaryButton on:click={toggleEdit}>Edit page</PrimaryButton>
  <LoginMenu />
</WebsiteHeader>

<div class="py-12 sm:py-24">
  <div class="max-w-(--breakpoint-md) mx-auto px-6 md:text-xl">
    <h1 class="pb-8 text-4xl font-bold md:text-7xl">
      <PlainText bind:content={title} />
    </h1>
    <div class="pb-12 prose md:prose-xl">
      <RichText multiLine bind:content={introContent} />
    </div>
    {#if $isEditing}
      <div class="mb-8">
        <PrimaryButton on:click={addProject}>Add Project</PrimaryButton>
      </div>
    {/if}

    {#each projects as project, index}
      <div class="border rounded-lg p-6 shadow-md mb-6">
        <h2 class="text-2xl font-bold mb-2">
          <PlainText bind:content={project.title} />
        </h2>
        {#if project.gitLink || project.liveLink}
          <div class="mb-4">
            {#if project.gitLink}
              <a href={project.gitLink} target="_blank" class="text-blue-500 hover:underline mr-4">GitHub</a>
            {/if}
            {#if project.liveLink}
              <a href={project.liveLink} target="_blank" class="text-blue-500 hover:underline">Live Demo</a>
            {/if}
          </div>
        {/if}
        <div class="prose mb-4">
          {#if project.expanded}
            <RichText multiLine bind:content={project.content} />
          {:else}
            <p>{extractTeaser(project.content, 100)}</p>
          {/if}
        </div>
        <button
          on:click={() => toggleProject(index)}
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          {project.expanded ? 'Collapse' : 'Expand'}
        </button>
        {#if $isEditing}
          <button
            on:click={() => removeProject(index)}
            class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 ml-4">Remove Project</button>
        {/if}
      </div>
    {/each}
  </div>
</div>

<Footer counter="/portfolio" />
