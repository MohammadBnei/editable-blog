<script>
  import Footer from '$lib/components/Footer.svelte';
  import PlainText from '$lib/components/PlainText.svelte';
  import RichText from '$lib/components/RichText.svelte';
  import LoginMenu from '$lib/components/LoginMenu.svelte';
  import PrimaryButton from '$lib/components/PrimaryButton.svelte';
  import { fetchJSON } from '$lib/util';
  import { currentUser, isEditing } from '$lib/stores.js';
  import WebsiteHeader from '$lib/components/WebsiteHeader.svelte';

  let { data } = $props();

  let showUserMenu = $state(false);
  let title = $derived(data.page?.title);
  let resumeContent = $derived(data.page?.resumeContent || ''); // Assuming the markdown content will be stored under 'resumeContent'
  let resumeDownloadContent = $derived(data.page?.resumeDownloadContent || '');

  $currentUser = data.currentUser;

  function toggleEdit() {
    $isEditing = true;
    showUserMenu = false;
  }

  async function savePage() {
    if (!$currentUser) return alert('Sorry, you are not authorized.');
    try {
      await fetchJSON('POST', '/api/save-page', {
        pageId: 'resume',
        page: {
          title,
          resumeContent, // Save the content back
          resumeDownloadContent
        }
      });
      $isEditing = false;
    } catch (err) {
      console.error(err);
      alert('There was an error. Please try again.');
    }
  }

  // Generate a description from resumeContent or a default
  const pageDescription = $derived(
    resumeContent
      ? resumeContent.replace(/<[^>]*>/g, '').substring(0, 160) + '...'
      : 'View and download my professional resume.'
  );
  const pageUrl = $derived(`https://blog.bnei.dev/resume`);
</script>

<svelte:head>
  <title>{title || 'Resume'}</title>
  <meta name="description" content={pageDescription} />
  <link rel="canonical" href={pageUrl} />
  <meta property="og:type" content="profile" />
  <!-- Or 'website' if preferred -->
  <meta property="og:title" content={title || 'Resume'} />
  <meta property="og:description" content={pageDescription} />
  <meta property="og:url" content={pageUrl} />
  <meta property="og:image" content="https://blog.bnei.dev/images/default-resume-image.jpg" />
  <!-- Consider a specific image for resume -->

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title || 'Resume'} />
  <meta name="twitter:description" content={pageDescription} />
  <meta name="twitter:image" content="https://blog.bnei.dev/images/default-resume-image.jpg" />
</svelte:head>

<WebsiteHeader bind:showUserMenu save={savePage}>
  <PrimaryButton on:click={toggleEdit}>Edit page</PrimaryButton>
  <LoginMenu />
</WebsiteHeader>

<div class="py-12 sm:py-24">
  <div class="max-w-(--breakpoint-md) mx-auto px-6 md:text-xl">
    <RichText bind:content={resumeDownloadContent} />
    <h1 class="pb-8 text-4xl font-bold md:text-7xl">
      <PlainText bind:content={title} />
    </h1>
    <div class="pb-12 prose md:prose-xl sm:pb-24">
      <RichText multiLine bind:content={resumeContent} />
    </div>
  </div>
</div>

<Footer counter="/resume" />
