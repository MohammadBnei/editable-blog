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
  let fileInput; // Reference to the hidden file input

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

  function exportPageContent() {
    const filename = `page-content-${data.lang || 'en'}.json`;
    const jsonStr = JSON.stringify(page, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function importPageContent(event) {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = e => {
      toggleEdit();

      try {
        const importedData = JSON.parse(e.target.result);
        // Overwrite existing page keys with imported ones
        for (const key in importedData) {
          if (Object.prototype.hasOwnProperty.call(importedData, key)) {
            page[key] = importedData[key];
          }
        }
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
    };
    reader.readAsText(file);
    // Reset the file input to allow importing the same file again
    event.target.value = '';
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
  <div class="flex flex-col gap-1">
    <PrimaryButton on:click={exportPageContent}>Export Page JSON</PrimaryButton>
    <PrimaryButton on:click={() => fileInput.click()}>Import Page JSON</PrimaryButton>
    <input
      type="file"
      accept="application/json"
      bind:this={fileInput}
      onchange={importPageContent}
      class="hidden"
    />
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

<!-- svelte-ignore element_invalid_self_closing_tag -->
<div class="divider" />

<!-- The Process -->
<div id="the-process" class="hero min-h-screen snap-center">
  <div class="hero-content">
    <div class="max-w-(--breakpoint-lg) space-y-2">
      <h1 class="text-2xl md:text-4xl font-bold text-center my-12">
        <PlainText bind:content={page.processTitle} />
      </h1>
      <h2 class="text-xl md:text-2xl text-center mb-12">
        <PlainText bind:content={page.processSubtitle} />
      </h2>

      <ul class="timeline timeline-snap-icon max-md:timeline-compact timeline-vertical">
        <li>
          <div class="timeline-middle">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              class="h-5 w-5"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div class="timeline-start mb-10 md:text-end">
            <time class="font-mono italic">Step 1</time>
            <div class="text-lg font-black prose">
              <PlainText bind:content={page.processStep1Title} />
            </div>
            <RichText multiLine bind:content={page.processStep1Content} />
          </div>
          <hr />
        </li>
        <li>
          <hr />
          <div class="timeline-middle">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              class="h-5 w-5"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div class="timeline-end md:mb-10">
            <time class="font-mono italic">Step 2</time>
            <div class="text-lg font-black prose">
              <PlainText bind:content={page.processStep2Title} />
            </div>
            <RichText multiLine bind:content={page.processStep2Content} />
          </div>
          <hr />
        </li>
        <li>
          <hr />
          <div class="timeline-middle">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              class="h-5 w-5"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div class="timeline-start mb-10 md:text-end">
            <time class="font-mono italic">Step 3</time>
            <div class="text-lg font-black prose">
              <PlainText bind:content={page.processStep3Title} />
            </div>
            <RichText multiLine bind:content={page.processStep3Content} />
          </div>
        </li>
      </ul>
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

<!-- svelte-ignore element_invalid_self_closing_tag -->
<div class="divider" />

<!-- Objection Handling (The FAQ) -->
<div id="objection-handling" class="hero min-h-screen snap-center">
  <div class="hero-content">
    <div class="max-w-(--breakpoint-lg)">
      <h1 class="text-2xl md:text-4xl font-bold text-center my-12">
        <PlainText bind:content={page.faqTitle} />
      </h1>
      <h2 class="text-xl md:text-2xl text-center mb-12">
        <PlainText bind:content={page.faqSubtitle} />
      </h2>

      <!-- Interaction 1: The Stack Clash -->
      <div class="chat chat-start">
        <div class="chat-header">Client</div>
        <div class="chat-bubble">
          <div class="prose">
            <RichText bind:content={page.faqClient1} />
          </div>
        </div>
      </div>
      <div class="chat chat-end">
        <div class="chat-header text-neutral-400">MBanaei</div>
        <div class="chat-bubble">
          <div class="prose">
            <RichText bind:content={page.faqYour1} />
          </div>
        </div>
      </div>

      <!-- Interaction 2: The Role Confusion -->
      <div class="chat chat-start">
        <div class="chat-bubble">
          <div class="prose">
            <RichText bind:content={page.faqClient2} />
          </div>
        </div>
      </div>
      <div class="chat chat-end">
        <div class="chat-bubble">
          <div class="prose">
            <RichText bind:content={page.faqYour2} />
          </div>
        </div>
      </div>

      <!-- Interaction 3: The "Bus Factor" Fear -->
      <div class="chat chat-start">
        <div class="chat-bubble">
          <div class="prose">
            <RichText bind:content={page.faqClient3} />
          </div>
        </div>
      </div>
      <div class="chat chat-end">
        <div class="chat-bubble">
          <div class="prose">
            <RichText bind:content={page.faqYour3} />
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- The Grand Finale: The Footer CTA -->
<div id="footer-cta" class="hero min-h-[50vh] snap-center bg-primary text-primary-content mt-24">
  <div class="hero-content text-center">
    <div class="max-w-md">
      <h2 class="text-4xl font-bold mb-4">
        <PlainText bind:content={page.ctaHeadline} />
      </h2>
      <div class="text-xl mb-8">
        <PlainText bind:content={page.ctaSubheadline} />
      </div>
      <PrimaryButton>
        <PlainText bind:content={page.ctaButtonText} />
      </PrimaryButton>
    </div>
  </div>
</div>

<Footer counter="/" />
