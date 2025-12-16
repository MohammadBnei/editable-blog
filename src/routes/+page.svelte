<script>
  import PlainText from '$lib/components/PlainText.svelte';
  import RichText from '$lib/components/RichText.svelte';
  import { fetchJSON } from '$lib/util';
  import PrimaryButton from '$lib/components/PrimaryButton.svelte';
  import SecondaryButton from '$lib/components/SecondaryButton.svelte';
  import LoginMenu from '$lib/components/LoginMenu.svelte';
  import ArticleTeaser from '$lib/components/ArticleTeaser.svelte';
  import Testimonial from '$lib/components/Testimonial.svelte';
  import IntroStep from '$lib/components/IntroStep.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import Image from '$lib/components/Image.svelte';
  import NotEditable from '$lib/components/NotEditable.svelte';
  import { currentUser, isEditing } from '$lib/stores.js';
  import WebsiteHeader from '$lib/components/WebsiteHeader.svelte';
  import TrustSection from '$lib/components/TrustSection.svelte';

  let { data } = $props();

  // --------------------------------------------------------------------------
  // DEFAULT PAGE CONTENT - AJDUST TO YOUR NEEDS
  // --------------------------------------------------------------------------
  const EMAIL = 'mohammad@bnei.dev';

  const FAQS_PLACEHOLDER = `
		<h2>What kind of projects do you work on?</h2>
    <p>I focus on building robust and efficient solutions, often leveraging Go for backend services, JavaScript/TypeScript for frontend development, and modern DevOps practices with Kubernetes and Docker.</p>
    <h2>Do you offer consulting services?</h2>
    <p>Yes, I'm available for consulting on system architecture, backend development, and cloud-native solutions. Feel free to reach out via email to discuss your needs.</p>
	`;

  const BIO_PLACEHOLDER = `
		<p>As a passionate developer, I thrive on crafting efficient and precise solutions to complex problems. My expertise spans Go, JavaScript/TypeScript, frontend and backend development, with a strong foundation in systems architecture, Kubernetes, Docker, and Linux (Debian).</p>
    <p>Beyond coding, I find balance and discipline in Thai boxing, and draw inspiration from nature and spiritual exploration. This blog is where I share my journey, projects, and insights.</p>
	`;

  const TESTIMONIALS_PLACEHOLDER = [
    {
      text: '“Mohammad-Amine consistently delivers high-quality, well-architected solutions. His deep understanding of systems and efficient problem-solving skills are truly impressive.”',
      image: '/images/person-placeholder.jpg',
      name: 'Colleague · Software Engineer'
    }
  ];

  const TRUST_PLACEHOLDER = [
    `## The "Deployment Anxiety" Fix

**The Pain:** "We dread deployments because they break production."

**The Architecture:** 3-Node HA Kubernetes Cluster + GitOps (ArgoCD)

**The Impact:**
- 90% Faster Releases: Cut deployment time from 2 hours to <10 minutes
- Stability: Reduced deployment failure rate from 40% to <5%`,

    `## The "Data Stagnation" Fix

**The Pain:** "Our analytics are useless because the data is hours old."

**The Architecture:** Parallelized Query Execution & MongoDB Aggregation

**The Impact:**
- 7x Velocity Increase: Reduced CSV export time from 15 minutes to <2 minutes for 100k+ records
- Efficiency: Eliminated blocking processes, allowing marketing teams instant access to data`,

    `## The "Latency" Fix

**The Pain:** "The app crashes or lags when user traffic spikes."

**The Architecture:** Real-time Redis ecosystem + High-Performance Webhooks

**The Impact:**
- <100ms Latency: Maintained sub-100ms response times for thousands of concurrent participants during live contests
- Scale: Zero message loss during "thundering herd" events via optimized Node.js/Go logic`
  ];

  let {
    title,
    subtitle,
    testimonials,
    faqs,
    introStep1,
    introStep2,
    introStep3,
    introStep4,
    bioTitle,
    bioPicture,
    bio,
    showUserMenu,
    trustCards
  } = $state({});

  function initOrReset() {
    $currentUser = data.currentUser;
    title = data.page?.title || 'Migrating fragile MVPs to high-performance Go architectures.';
    subtitle = data.page?.subtitle || 'I turn \'It works on my machine\' into \'It scales in production.\'';
    faqs = data.page?.faqs || FAQS_PLACEHOLDER;

    // Make a deep copy
    testimonials = JSON.parse(JSON.stringify(data.page?.testimonials || TESTIMONIALS_PLACEHOLDER));

    introStep1 = JSON.parse(
      JSON.stringify(
        data.page?.introStep1 || {
          label: 'BUILD',
          title: 'Crafting Code',
          description:
            'Exploring the process of developing efficient and reliable software solutions.'
        }
      )
    );
    introStep2 = JSON.parse(
      JSON.stringify(
        data.page?.introStep2 || {
          label: 'ORCHESTRATE',
          title: 'Navigating Systems',
          description: 'Insights into designing and managing complex, scalable infrastructures.'
        }
      )
    );
    introStep3 = JSON.parse(
      JSON.stringify(
        data.page?.introStep3 || {
          label: 'LEARN',
          title: 'Sharing Discoveries',
          description:
            'Documenting insights and lessons learned from various technical explorations.'
        }
      )
    );
    introStep4 = JSON.parse(
      JSON.stringify(
        data.page?.introStep4 || {
          label: 'REFLECT',
          title: 'Beyond the Screen',
          description: 'A glimpse into the personal pursuits that inspire and inform my approach.'
        }
      )
    );
    bioPicture = data.page?.bioPicture;
    bioTitle = data.page?.bioTitle;
    bio = data.page?.bio || BIO_PLACEHOLDER;
    trustCards = data.page?.trustCards || TRUST_PLACEHOLDER;
    $isEditing = false;
  }

  // --------------------------------------------------------------------------
  // Page logic
  // --------------------------------------------------------------------------

  function toggleEdit() {
    $isEditing = true;
    showUserMenu = false;
  }

  function addTestimonial() {
    testimonials.push({
      text: '“Add a quote text here”',
      image: '/images/person-placeholder.jpg',
      name: 'Firstname Lastname · example.com'
    });
    testimonials = testimonials; // trigger update
  }

  function deleteTestimonial(index) {
    testimonials.splice(index, 1);
    testimonials = testimonials; // trigger update
  }

  function moveTestimonial(index, direction) {
    let toIndex;
    if (direction === 'up' && index > 0) {
      toIndex = index - 1;
    } else if (direction === 'down' && index < testimonials.length - 1) {
      toIndex = index + 1;
    } else {
      return; // operation not possible
    }
    // Remove item from original position
    const element = testimonials.splice(index, 1)[0];
    // Insert at new position
    testimonials.splice(toIndex, 0, element);
    testimonials = testimonials; // trigger update
  }

  async function savePage() {
    try {
      // Only persist the start page when logged in as an admin
      if ($currentUser) {
        await fetchJSON('POST', '/api/save-page', {
          pageId: 'home',
          page: {
            title,
            subtitle,
            faqs,
            testimonials,
            introStep1,
            introStep2,
            introStep3,
            introStep4,
            bioPicture,
            bioTitle,
            bio,
            trustCards
          }
        });
      }
      $isEditing = false;
    } catch (err) {
      console.error(err);
      alert('There was an error. Please try again.');
    }
  }

  initOrReset();

  $effect(() => {
    initOrReset();
  });
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={bio} />
  <link rel="alternate" hreflang="en" href="https://blog.bnei.dev" />
  <link rel="canonical" href="https://blog.bnei.dev" />

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://blog.bnei.dev" />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={bio} />
  <meta property="og:image" content="https://blog.bnei.dev{bioPicture}" />

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:url" content="https://blog.bnei.dev" />
  <meta property="twitter:title" content={title} />
  <meta property="twitter:description" content={bio} />
  <meta property="twitter:image" content="https://blog.bnei.dev{bioPicture}" />
</svelte:head>

<WebsiteHeader bind:showUserMenu cancel={initOrReset} save={savePage}>
  <div class="flex flex-col">
    <PrimaryButton on:click={toggleEdit}>Edit Page</PrimaryButton>
    <LoginMenu />
  </div>
</WebsiteHeader>

<div>
  <div class="max-w-(--breakpoint-lg) mx-auto px-6 pt-12 sm:pt-24">
    <NotEditable>
      <img
        class="pb-8 w-40 sm:w-56 mx-auto"
        viewBox="0 0 200 200"
        src="/images/cloud-system.svg"
        alt="Cloud System"
      />
    </NotEditable>
    <h1 class="text-4xl md:text-7xl font-bold text-center">
      <PlainText bind:content={title} />
    </h1>
    <p class="text-xl md:text-2xl text-center mt-4">
      <PlainText bind:content={subtitle} />
    </p>
  </div>
</div>

<!-- Bio -->
<div id="contact" class=" border-gray-100 pb-12 sm:pb-24">
  <div class="max-w-(--breakpoint-lg) mx-auto px-6">
    <div class="pt-12 sm:pt-24 pb-12 text-center">
      <div class="w-48 h-48 md:w-72 md:h-72 mx-auto overflow-hidden relative rounded-full">
        <Image
          class="block w-48 h-48 md:w-72 md:h-72 rounded-full"
          maxWidth="384"
          maxHeight="384"
          bind:src={bioPicture}
          alt="Mohammad-Amine BANAEI"
        />
      </div>
    </div>
    <div class="">
      <h1 class="text-3xl md:text-5xl font-bold">
        <PlainText bind:content={bioTitle} />
      </h1>
    </div>
    <div class="pb-6">
      <RichText multiLine bind:content={bio} />
    </div>
  </div>
</div>

<div class="border-gray-100 border-b-2">
  <div class="max-w-(--breakpoint-lg) mx-auto px-6">
    <div class="relative">
      <div class="w-1 bg-gray-900 absolute inset-0 -top-8 bottom-12 mx-auto z-0">
        <div class="w-4 h-4 rounded-full bg-gray-900 absolute -top-1 -left-1.5"></div>
      </div>
      <div class="z-10">
        <IntroStep bind:intro={introStep1} />
        <IntroStep bind:intro={introStep2} />
        <IntroStep bind:intro={introStep3} />
        <IntroStep bind:intro={introStep4} />
      </div>
    </div>
    <div class="relative h-14">
      <div class="w-1 bg-gray-900 absolute inset-0 -top-16 bottom-12 mx-auto z-0">
        <div
          class="absolute -bottom-2 -left-[7px] h-0 w-0 border-x-[9px] border-x-transparent border-t-10 border-gray-900"
        ></div>
      </div>
    </div>
    <div class="text-center mb-32 flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
      <PrimaryButton
        size="lg"
        type="button"
        on:click={() =>
          document
            .getElementById('productized-services')
            .scrollIntoView({ behavior: 'smooth', block: 'start' })}
        >Plan Your Migration</PrimaryButton
      >
    </div>
  </div>
</div>

<!-- Trust Section - Replaces Testimonials -->
<div id="trust-section">
  <TrustSection bind:trustCards />
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
      <RichText multiLine bind:content={faqs} />
    </div>
  </div>
</div>

<Footer counter="/" />
