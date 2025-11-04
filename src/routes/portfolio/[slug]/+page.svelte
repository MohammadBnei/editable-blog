<script>
  import Footer from '$lib/components/Footer.svelte';
  import RichText from '$lib/components/RichText.svelte';
  import { currentUser } from '$lib/stores.js';
  import { extractTeaser } from '$lib/util';

  let { data } = $props();

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

<div class="navbar bg-base-100">
  <div class="navbar-start">
    <a href="/portfolio" class="btn btn-ghost text-xl">Portfolio</a>
  </div>
  <div class="navbar-end">
    {#if $currentUser}
      <div class="dropdown dropdown-end">
        <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
          <div class="w-10 rounded-full">
            <img alt="User Avatar" src="https://www.gravatar.com/avatar/{$currentUser.emailHash}?d=retro" />
          </div>
        </div>
        <ul tabindex="0" class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
          <li>
            <a href="/profile" class="justify-between">
              Profile
              <span class="badge">New</span>
            </a>
          </li>
          <li><a href="/logout">Logout</a></li>
        </ul>
      </div>
    {:else}
      <a href="/login" class="btn btn-ghost">Login</a>
    {/if}
  </div>
</div>

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
        <a href={project.gitLink} target="_blank" rel="noopener noreferrer" class="btn btn-primary">
          GitHub
        </a>
      {/if}
      {#if project.liveLink}
        <a href={project.liveLink} target="_blank" rel="noopener noreferrer" class="btn btn-secondary">
          Live Demo
        </a>
      {/if}
    </div>
  </div>
</div>

<Footer />
