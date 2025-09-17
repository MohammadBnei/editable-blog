<script>
  import Footer from '$lib/components/Footer.svelte';
  import PlainText from '$lib/components/PlainText.svelte';
  import RichText from '$lib/components/RichText.svelte';
  import LoginMenu from '$lib/components/LoginMenu.svelte';
  import SecondaryButton from '$lib/components/SecondaryButton.svelte';
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

  // Generate a description from introContent or a default
  const pageDescription = $derived(introContent ? extractTeaser(introContent, 160) : 'Explore my portfolio of projects and work.');
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
  <meta property="og:image" content="https://blog.bnei.dev/images/default-portfolio-image.jpg" /> <!-- Consider a specific image for portfolio -->

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={pageDescription} />
  <meta name="twitter:image" content="https://blog.bnei.dev/images/default-portfolio-image.jpg" />
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
        <div class="flex justify-end align-middle">
          <SecondaryButton size="sm" on:click={() => toggleProject(index)}>
            {project.expanded ? 'Collapse' : 'Expand'}
          </SecondaryButton>
        </div>
        <div class="prose mb-4">
          {#if project.expanded || $isEditing}
            <RichText multiLine bind:content={project.content} />
          {:else}
            <RichText multiLine content={extractTeaser(project.content, 100)} />
          {/if}
        </div>

        {#if $isEditing}
          <SecondaryButton
            on:click={() => removeProject(index)}
            size="sm"
            >Remove Project</SecondaryButton
          >
        {/if}
      </div>
    {/each}
  </div>
</div>

<Footer counter="/portfolio" />
