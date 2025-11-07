<script>
  import Footer from '$lib/components/Footer.svelte';
  import PlainText from '$lib/components/PlainText.svelte';
  import RichText from '$lib/components/RichText.svelte';
  import LoginMenu from '$lib/components/LoginMenu.svelte';
  import SecondaryButton from '$lib/components/SecondaryButton.svelte';
  import PrimaryButton from '$lib/components/PrimaryButton.svelte';
  import PortfolioProject from '$lib/components/PortfolioProject.svelte'; // Import the new component
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

  function generateSlug(inputTitle) {
    return inputTitle.toLowerCase().replace(/\s+/g, '_');
  }

  function toggleEdit() {
    $isEditing = true;
    showUserMenu = false;
  }

  function addProject() {
    const newProjectTitle = 'New Project';
    projects.push({
      title: newProjectTitle,
      content: '',
      gitLink: '',
      liveLink: '',
      expanded: false,
      slug: generateSlug(newProjectTitle) // Generate slug from initial title
    });
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
    {#if $isEditing}
      <div class="mb-8">
        <PrimaryButton on:click={addProject}>Add Project</PrimaryButton>
      </div>
    {/if}

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
