<script>
  import PlainText from '$lib/components/PlainText.svelte';
  import RichText from '$lib/components/RichText.svelte';
  import { fetchJSON } from '$lib/util';
  import PrimaryButton from '$lib/components/PrimaryButton.svelte';
  import LoginMenu from '$lib/components/LoginMenu.svelte';
  import ArticleTeaser from '$lib/components/ArticleTeaser.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import Image from '$lib/components/Image.svelte';
  import NotEditable from '$lib/components/NotEditable.svelte';
  import { currentUser, isEditing } from '$lib/stores.js';
  import WebsiteHeader from '$lib/components/WebsiteHeader.svelte';

  let { data } = $props();

  let page = $derived(data.page || {});

  let showUserMenu = $state(false);
  // --------------------------------------------------------------------------
  // Page logic
  // --------------------------------------------------------------------------

  function toggleEdit() {
    $isEditing = true;
    showUserMenu = false;
  }

  async function savePage() {
    try {
      // Only persist the start page when logged in as an admin
      if ($currentUser) {
        await fetchJSON('POST', '/api/save-page', {
          pageId: 'home',
          page
        });
      }
      $isEditing = false;
    } catch (err) {
      console.error(err);
      alert('There was an error. Please try again.');
    }
  }
</script>

<svelte:head>
  <title>{page.title}</title>
  <meta name="description" content={page.bio} />
  <link rel="alternate" hreflang="en" href="https://blog.bnei.dev" />
  <link rel="canonical" href="https://blog.bnei.dev" />

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://blog.bnei.dev" />
  <meta property="og:title" content={page.title} />
  <meta property="og:description" content={page.bio} />
  <meta property="og:image" content="https://blog.bnei.dev{page.bioPicture}" />

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:url" content="https://blog.bnei.dev" />
  <meta property="twitter:title" content={page.title} />
  <meta property="twitter:description" content={page.bio} />
  <meta property="twitter:image" content="https://blog.bnei.dev{page.bioPicture}" />
</svelte:head>

<WebsiteHeader bind:showUserMenu cancel={() => ($isEditing = false)} save={savePage}>
  <div class="flex flex-col">
    <PrimaryButton on:click={toggleEdit}>Edit Page</PrimaryButton>
    <LoginMenu />
  </div>
</WebsiteHeader>

<div id="headline" class="hero min-h-[91vh] snap-center">
  <div class="hero-content">
    <div class="max-w-(--breakpoint-lg)">
      <h1 class="text-4xl md:text-7xl font-bold text-center mb-4">
        <PlainText bind:content={page.title} />
      </h1>
      <div class="text-xl md:text-2xl text-center mb-12">
        <PlainText bind:content={page.subtitle} />
      </div>
      <div class="md:text-xl mt-4 prose m-auto">
        <RichText multiLine bind:content={page.pitch} />
      </div>
    </div>
  </div>
</div>

<!-- svelte-ignore element_invalid_self_closing_tag -->
<div class="divider" />

<div id="pillars" class="hero min-h-screen snap-center">
  <div class="hero-content">
    <div class="max-w-(--breakpoint-lg) overflow-auto">
      <h1 class="text-2xl md:text-4xl font-bold text-center mb-12">
        <PlainText bind:content={page.pillarTitle} />
      </h1>
      <div class="stats stats-vertical lg:stats-horizontal shadow">
        <div class="stat prose md:text-xl">
          <RichText multiLine bind:content={page.pillar1} />
        </div>
        <div class="stat prose md:text-xl">
          <RichText multiLine bind:content={page.pillar2} />
        </div>
        <div class="stat prose md:text-xl">
          <RichText multiLine bind:content={page.pillar3} />
        </div>
      </div>
    </div>
  </div>
</div>

<!-- svelte-ignore element_invalid_self_closing_tag -->
<div class="divider" />

<div id="engagements" class="hero min-h-screen snap-center">
  <div class="hero-content">
    <div class="max-w-(--breakpoint-lg) space-y-2">
      <h1 class="text-2xl md:text-4xl font-bold text-center my-12">
        <PlainText bind:content={page.engagementTitle} />
      </h1>
      <div class="card shadow-sm">
        <div class="card-body prose md:text-xl">
          <RichText multiLine bind:content={page.engagement1} />
        </div>
      </div>
      <div class="card shadow-sm">
        <div class="card-body prose md:text-xl">
          <RichText multiLine bind:content={page.engagement2} />
        </div>
      </div>
      <div class="card shadow-sm">
        <div class="card-body prose md:text-xl">
          <RichText multiLine bind:content={page.engagement3} />
        </div>
      </div>
    </div>
  </div>
</div>

<!-- svelte-ignore element_invalid_self_closing_tag -->
<div class="divider" />

<div id="provenresults" class="hero min-h-screen snap-center">
  <div class="hero-content">
    <div class="max-w-(--breakpoint-lg) space-y-2">
      <h1 class="text-2xl md:text-4xl font-bold text-center my-12">
        <PlainText bind:content={page.provenTitle} />
      </h1>
      <div class="card shadow-sm">
        <div class="card-body prose md:text-xl">
          <RichText multiLine bind:content={page.proven1} />
        </div>
      </div>
      <div class="card shadow-sm">
        <div class="card-body prose md:text-xl">
          <RichText multiLine bind:content={page.proven2} />
        </div>
      </div>
      <div class="card shadow-sm">
        <div class="card-body prose md:text-xl">
          <RichText multiLine bind:content={page.proven3} />
        </div>
      </div>
    </div>
  </div>
</div>

<!-- svelte-ignore element_invalid_self_closing_tag -->
<div class="divider" />

<!-- Bio -->
<div id="contact" class="hero min-h-screen snap-center">
  <div class="hero-content">
    <div class="max-w-(--breakpoint-lg) overflow-auto">
      <div class="w-48 h-48 md:w-72 md:h-72 mx-auto overflow-hidden relative rounded-full">
        <Image
          class="block w-48 h-48 md:w-72 md:h-72 rounded-full"
          maxWidth="384"
          maxHeight="384"
          bind:src={page.bioPicture}
          alt="Mohammad-Amine BANAEI"
        />
      </div>
      <h1 class="text-2xl md:text-4xl font-bold text-center mb-12">
        <PlainText bind:content={page.bioTitle} />
      </h1>
      <div class="stats stats-vertical lg:stats-horizontal shadow lg:grid-cols-2 lg:gap-4">
        <div class="stat prose md:text-xl">
          <RichText multiLine bind:content={page.bio} />
        </div>
        <div class="stat prose md:text-xl">
          <RichText multiLine bind:content={page.knowledgeTransfer} />
        </div>
      </div>
    </div>
  </div>
</div>

{#if data.articles?.length > 0}
  <NotEditable>
    <div class="bg-white border-t-2 border-gray-100 pb-10 sm:pb-16">
      <div class="max-w-(--breakpoint-lg) mx-auto px-6 pt-12 sm:pt-24">
        <div class="font-bold text-sm sm:text-base">FROM THE BLOG</div>
      </div>
      {#each data.articles as article, i}
        <ArticleTeaser {article} firstEntry={i === 0} />
      {/each}
    </div>
  </NotEditable>
{/if}

<!-- FAQs -->
<div class="bg-white">
  <div class="max-w-(--breakpoint-lg) mx-auto px-6">
    <div class="font-bold text-sm sm:text-base">FAQs</div>
    <div class="prose md:prose-xl pb-12 sm:pb-24">
      <RichText multiLine bind:content={page.faqs} />
    </div>
  </div>
</div>

<Footer counter="/" />
