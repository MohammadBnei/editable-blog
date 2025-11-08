<script>
  import Footer from '$lib/components/Footer.svelte';
  import PlainText from '$lib/components/PlainText.svelte';
  import RichText from '$lib/components/RichText.svelte';
  import LoginMenu from '$lib/components/LoginMenu.svelte';
  import PrimaryButton from '$lib/components/PrimaryButton.svelte';
  import PortfolioProject from '$lib/components/PortfolioProject.svelte'; // Import the new component
  import NewProjectModal from '$lib/components/NewProjectModal.svelte'; // Import the new modal component
  import ConfirmModal from '$lib/components/ConfirmModal.svelte'; // Import the ConfirmModal
  import { fetchJSON } from '$lib/util';
  import { extractTeaser } from '$lib/util';
  import { currentUser, isEditing } from '$lib/stores.js';
  import WebsiteHeader from '$lib/components/WebsiteHeader.svelte';
  import { goto } from '$app/navigation';

  let { data } = $props();

  let showUserMenu = $state(false);
  let showNewProjectModal = $state(false); // State to control new project modal visibility
  let showConfirmRemoveModal = $state(false); // State to control remove project confirmation modal visibility
  let projectToRemoveIndex = $state(null); // Index of the project to remove
  let title = $derived(data.page?.title || 'My Portfolio');
  let introContent = $derived(data.page?.introContent || ''); // Optional intro text for the page
  let projects = $derived(data.page?.projects || []); // Array of projects, each with title, content (markdown), gitLink, liveLink

  $currentUser = data.currentUser;

  function generateSlug(inputTitle) {
    return inputTitle.toLowerCase().replace(/\s+/g, '_');
  }

  function toggleEdit() {
    $isEditing = true;
    showUserMenu = false;
  }

  async function handleNewProject(event) {
    const { projectTitle } = event.detail; // Only projectTitle is received now
    const newProjectSlug = generateSlug(projectTitle);

    const newProject = {
      title: projectTitle,
      content: '', // Initialize with empty content
      gitLink: '', // Initialize with empty gitLink
      liveLink: '', // Initialize with empty liveLink
      expanded: false,
      slug: newProjectSlug
    };

    // Add the new project to the existing projects array
    const updatedProjects = [...projects, newProject];

    // Save the updated portfolio page
    try {
      await fetchJSON('POST', '/api/save-page', {
        pageId: 'portfolio',
        page: {
          title,
          introContent,
          projects: updatedProjects
        }
      });
      showNewProjectModal = false;
      $isEditing = true; // Activate edit mode on the new project page
      goto(`/portfolio/${newProjectSlug}`); // Redirect to the new project's page
    } catch (err) {
      console.error('Error creating new project:', err);
      // Optionally, show an error message to the user
    }
  }

  function removeProject(index) {
    projectToRemoveIndex = index;
    showConfirmRemoveModal = true;
  }

  async function handleRemoveProjectConfirm() {
    showConfirmRemoveModal = false;
    if (projectToRemoveIndex !== null) {
      projects.splice(projectToRemoveIndex, 1);
      projects = [...projects]; // Trigger reactivity

      try {
        await fetchJSON('POST', '/api/save-page', {
          pageId: 'portfolio',
          page: {
            title,
            introContent,
            projects
          }
        });
        // Project removed successfully!
      } catch (err) {
        console.error('Error removing project:', err);
        // Optionally, show an error message to the user
      } finally {
        projectToRemoveIndex = null;
      }
    }
  }

  function toggleProject(index) {
    projects[index].expanded = !projects[index].expanded;
    projects = [...projects]; // Trigger reactivity
  }

  async function savePage() {
    if (!$currentUser) return; // Not authorized, do nothing
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
      // There was an error. Please try again. (No alert)
    }
  }

  // Generate a description from introContent or a default
  const pageDescription = $derived(
    introContent ? extractTeaser(introContent, 160) : 'Explore my portfolio of projects and work.'
  );
  const pageUrl = $derived(`https://blog.bnei.dev/portfolio`);
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={pageDescription} />
  <link rel="canonical" href={pageUrl} />
  <meta property="og:type" content="website" />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={pageDescription} />
  <meta property="og:url" content={pageUrl} />
  <meta property="og:image" content="https://blog.bnei.dev/images/default-portfolio-image.jpg" />
  <!-- Consider a specific image for portfolio -->

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title} />
  <meta property="twitter:description" content={pageDescription} />
  <meta
    property="twitter:image"
    content="https://blog.bnei.dev/images/default-portfolio-image.jpg"
  />
</svelte:head>

<WebsiteHeader bind:showUserMenu save={savePage}>
  <PrimaryButton on:click={toggleEdit}>Edit page</PrimaryButton>
  <PrimaryButton on:click={() => (showNewProjectModal = true)}>New Project</PrimaryButton>
  <LoginMenu />
</WebsiteHeader>

<div class="py-12 sm:py-24">
  <div class="max-w-(--breakpoint-lg) mx-auto px-6 md:text-xl">
    <a href="/api/raw/portfolio" class="btn btn-sm">
      <svg xmlns="http://www.w3.org/2000/svg" height="1.3em" viewBox="0 0 25 25">
        <path
          fill="currentColor"
          d="M18.92 6.05a.75.75 0 0 0-.598-.297L9.327 5.75a.75.75 0 1 0 0 1.5l7.19.002l-10.72 10.72a.75.75 0 0 0 1.061 1.06L17.573 8.318l.002 7.177a.75.75 0 0 0 1.5-.001l-.003-8.933a.75.75 0 0 0-.152-.51"
        />
      </svg>
      markdown
    </a>
    <h1 class="pb-8 text-4xl font-bold md:text-7xl">
      <PlainText bind:content={title} />
    </h1>
    <div class="pb-12 prose md:prose-xl">
      <RichText multiLine bind:content={introContent} />
    </div>

    {#each projects as project, index}
      <PortfolioProject
        bind:project={projects[index]}
        {index}
        onRemove={removeProject}
        onToggleExpand={toggleProject}
        {generateSlug}
      />
    {/each}
  </div>
</div>

<Footer counter="/portfolio" />

{#if showNewProjectModal}
  <NewProjectModal on:close={() => (showNewProjectModal = false)} on:create={handleNewProject} />
{/if}

{#if showConfirmRemoveModal}
  <ConfirmModal
    message={`Are you sure you want to remove the project "${projects[projectToRemoveIndex]?.title}"? This action cannot be undone.`}
    on:confirm={handleRemoveProjectConfirm}
    on:cancel={() => {
      showConfirmRemoveModal = false;
      projectToRemoveIndex = null;
    }}
  />
{/if}
