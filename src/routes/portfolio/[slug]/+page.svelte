<script>
  import Footer from '$lib/components/Footer.svelte';
  import RichText from '$lib/components/RichText.svelte';
  import PlainText from '$lib/components/PlainText.svelte';
  import LoginMenu from '$lib/components/LoginMenu.svelte';
  import PrimaryButton from '$lib/components/PrimaryButton.svelte';
  import WebsiteHeader from '$lib/components/WebsiteHeader.svelte';
  import { currentUser, isEditing } from '$lib/stores.js';
  import { extractTeaser, fetchJSON } from '$lib/util';

  let { data } = $props();

  let showUserMenu = $state(false);
  let project = $state(data.project); // Make project stateful for editing
  let portfolioPage = $state(data.portfolioPage); // Keep track of the whole portfolio page to update it

  $currentUser = data.currentUser;

  function generateSlug(inputTitle) {
    return inputTitle.toLowerCase().replace(/\s+/g, '_');
  }

  // Generate a description from project content or a default
  const pageDescription = $derived(
    project.content ? extractTeaser(project.content, 160) : `Details for ${project.title} project.`
  );
  const pageUrl = $derived(`https://blog.bnei.dev/portfolio/${project.slug}`);

  function toggleEdit() {
    $isEditing = true;
    showUserMenu = false;
  }

  async function saveProject() {
    if (!$currentUser) return; // Not authorized, do nothing

    // Find the index of the current project in the portfolioPage.projects array
    const projectIndex = portfolioPage.projects.findIndex(p => p.slug === project.slug);

    if (projectIndex !== -1) {
      // Update the project in the local portfolioPage state
      portfolioPage.projects[projectIndex] = project;

      try {
        await fetchJSON('POST', '/api/save-page', {
          pageId: 'portfolio',
          page: {
            title: portfolioPage.title,
            introContent: portfolioPage.introContent,
            projects: portfolioPage.projects
          }
        });
        $isEditing = false;
        // Project saved successfully! (No alert)
      } catch (err) {
        console.error(err);
        // There was an error saving the project. Please try again. (No alert)
      }
    } else {
      // Error: Project not found in portfolio data. (No alert)
      console.error('Error: Project not found in portfolio data.');
    }
  }

  function handleTitleInput() {
    project.slug = generateSlug(project.title);
  }
</script>

<svelte:head>
  <title>{project.title}</title>
  <meta name="description" content={pageDescription} />
  <link rel="canonical" href={pageUrl} />
  <meta property="og:type" content="article" />
  <meta property="og:title" content={project.title} />
  <meta property="og:description" content={pageDescription} />
  <meta property="og:url" content={pageUrl} />
  <meta property="og:image" content="https://blog.bnei.dev/images/default-portfolio-image.jpg" />
  <!-- Consider a specific image for portfolio -->

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={project.title} />
  <meta property="twitter:description" content={pageDescription} />
  <meta property="twitter:image" content="https://blog.bnei.dev/images/default-portfolio-image.jpg" />
</svelte:head>

<WebsiteHeader bind:showUserMenu save={saveProject}>
  <PrimaryButton on:click={toggleEdit}>Edit Project</PrimaryButton>
  <LoginMenu />
</WebsiteHeader>

<div class="py-12 sm:py-24">
  <div class="max-w-(--breakpoint-lg) mx-auto px-6 md:text-xl">
    <div class="mb-8">
      <a href="/api/raw/portfolio/{project.slug}" class="btn btn-sm">
        <svg xmlns="http://www.w3.org/2000/svg" height="1.3em" viewBox="0 0 25 25">
          <path
            fill="currentColor"
            d="M18.92 6.05a.75.75 0 0 0-.598-.297L9.327 5.75a.75.75 0 1 0 0 1.5l7.19.002l-10.72 10.72a.75.75 0 0 0 1.061 1.06L17.573 8.318l.002 7.177a.75.75 0 0 0 1.5-.001l-.003-8.933a.75.75 0 0 0-.152-.51"
          />
        </svg>
        markdown
      </a>
    </div>
    <h1 class="pb-8 text-4xl font-bold md:text-7xl">
      {#if $isEditing}
        <PlainText bind:content={project.title} on:input={handleTitleInput} />
      {:else}
        {project.title}
      {/if}
    </h1>
    <div class="prose md:prose-xl">
      {#if $isEditing}
        <RichText multiLine bind:content={project.content} />
      {:else}
        <RichText multiLine content={project.content} />
      {/if}
    </div>

    <div class="mt-8 flex gap-4">
      {#if $isEditing}
        <div class="flex flex-col w-full">
          <label for="project-git" class="block text-sm font-medium text-gray-700">GitHub Link</label>
          <PlainText id="project-git" bind:content={project.gitLink} class="mt-1 block w-full" />
        </div>
        <div class="flex flex-col w-full">
          <label for="project-live" class="block text-sm font-medium text-gray-700">Live Demo Link</label>
          <PlainText id="project-live" bind:content={project.liveLink} class="mt-1 block w-full" />
        </div>
        <div class="flex flex-col w-full">
          <label for="project-slug" class="block text-sm font-medium text-gray-700">Project Slug</label>
          <PlainText id="project-slug" bind:content={project.slug} class="mt-1 block w-full" />
        </div>
      {:else}
        {#if project.gitLink}
          <a href={project.gitLink} rel="noopener noreferrer" class="btn btn-primary">
            GitHub
          </a>
        {/if}
        {#if project.liveLink}
          <a href={project.liveLink} rel="noopener noreferrer" class="btn btn-secondary">
            Live Demo
          </a>
        {/if}
      {/if}
    </div>
  </div>
</div>

<Footer />
