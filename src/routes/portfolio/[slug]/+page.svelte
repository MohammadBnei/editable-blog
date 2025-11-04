<script>
  import Footer from '$lib/components/Footer.svelte';
  import RichText from '$lib/components/RichText.svelte';
  import LoginMenu from '$lib/components/LoginMenu.svelte';
  import WebsiteHeader from '$lib/components/WebsiteHeader.svelte';
  import { currentUser } from '$lib/stores.js';
  import { extractTeaser } from '$lib/util';

  let { data } = $props();

  let showUserMenu = $state(false);
  let project = $derived(data.project);

  $currentUser = data.currentUser;

  // Generate a description from project content or a default
  const pageDescription = $derived(
    project.content ? extractTeaser(project.content, 160) : `Details for ${project.title} project.`
  );
  const pageUrl = $derived(`https://blog.bnei.dev/portfolio/${project.slug}`);
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
  <meta name="twitter:description" content={pageDescription} />
  <meta name="twitter:image" content="https://blog.bnei.dev/images/default-portfolio-image.jpg" />
</svelte:head>

<WebsiteHeader bind:showUserMenu>
  <LoginMenu />
</WebsiteHeader>

<div class="py-12 sm:py-24">
  <div class="max-w-(--breakpoint-lg) mx-auto px-6 md:text-xl">
    <h1 class="pb-8 text-4xl font-bold md:text-7xl">
      {project.title}
    </h1>
    <div class="prose md:prose-xl">
      <RichText multiLine content={project.content} />
    </div>

    <div class="mt-8 flex gap-4">
      {#if project.gitLink}
        <a href={project.gitLink} target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">
          GitHub
        </a>
      {/if}
      {#if project.liveLink}
        <a href={project.liveLink} target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">
          Live Demo
        </a>
      {/if}
    </div>
  </div>
</div>

<Footer />
