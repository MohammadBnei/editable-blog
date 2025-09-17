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

  let {
    title,
    testimonials,
    faqs,
    introStep1,
    introStep2,
    introStep3,
    introStep4,
    bioTitle,
    bioPicture,
    bio,
    showUserMenu
  } = $state({});

  function initOrReset() {
    $currentUser = data.currentUser;
    title = data.page?.title || 'Mohammad-Amine BANAEI - <br>Projects & Knowledge Blog';
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
    bioPicture = data.page?.bioPicture || '/images/person-placeholder.jpg';
    bioTitle = data.page?.bioTitle || "Hi, I'm Mohammad-Amine BANAEI — Welcome to my blog!";
    bio = data.page?.bio || BIO_PLACEHOLDER;
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
            faqs,
            testimonials,
            introStep1,
            introStep2,
            introStep3,
            introStep4,
            bioPicture,
            bioTitle,
            bio
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
  })

  // Clean up HTML tags from bio for meta description
  $: cleanedBio = bio.replace(/<[^>]*>/g, '');
  $: pageTitle = title.replace(/<br>/g, ' '); // Replace <br> for cleaner title in meta
</script>

<svelte:head>
  <title>{@html pageTitle}</title>
  <meta name="description" content={cleanedBio} />
  <link rel="alternate" hreflang="en" href="https://blog.bnei.dev" />
  <link rel="canonical" href="https://blog.bnei.dev" />

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://blog.bnei.dev" />
  <meta property="og:title" content={pageTitle} />
  <meta property="og:description" content={cleanedBio} />
  <meta property="og:image" content="https://blog.bnei.dev{bioPicture}" />

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:url" content="https://blog.bnei.dev" />
  <meta property="twitter:title" content={pageTitle} />
  <meta property="twitter:description" content={cleanedBio} />
  <meta property="twitter:image" content="https://blog.bnei.dev{bioPicture}" />
</svelte:head>

<WebsiteHeader bind:showUserMenu cancel={initOrReset} save={savePage}>
  <PrimaryButton on:click={toggleEdit}>Edit Page</PrimaryButton>
  <LoginMenu />
</WebsiteHeader>

<div>
  <div class="max-w-(--breakpoint-md) mx-auto px-6 pt-12 sm:pt-24">
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
  </div>
</div>

<div class="pt-12 md:pt-24 border-gray-100 border-b-2">
  <div class="max-w-(--breakpoint-md) mx-auto px-6">
    <div class="relative">
      <div class="w-1 bg-gray-900 absolute inset-0 -top-8 bottom-12 mx-auto z-0">
        <div class="w-4 h-4 rounded-full bg-gray-900 absolute -top-1 -left-[6px]"></div>
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
    <div class="text-center mb-32">
      <PrimaryButton
        size="lg"
        type="button"
        on:click={() =>
          document.getElementById('contact').scrollIntoView({ behavior: 'smooth', block: 'start' })}
        >Explore my work</PrimaryButton
      >
    </div>
  </div>
</div>

<div class="bg-white pb-6 sm:pb-12">
  <div class="max-w-(--breakpoint-md) mx-auto px-6">
    <div class="font-bold text-sm sm:text-base py-12 sm:pt-24 pb-8">WHAT PEOPLE SAY</div>
  </div>
  {#each testimonials as _, i}
    <Testimonial
      bind:testimonial={testimonials[i]}
      firstEntry={i === 0}
      lastEntry={i === testimonials?.length - 1}
      on:delete={() => deleteTestimonial(i)}
      on:up={() => moveTestimonial(i, 'up')}
      on:down={() => moveTestimonial(i, 'down')}
    />
  {/each}

  {#if $isEditing}
    <div class="text-center pb-12 border-b border-gray-100">
      <SecondaryButton on:click={addTestimonial}>Add Testimonial</SecondaryButton>
    </div>
  {/if}
</div>

{#if data.articles?.length > 0}
  <NotEditable>
    <div class="bg-white border-t-2 border-gray-100 pb-10 sm:pb-16">
      <div class="max-w-(--breakpoint-md) mx-auto px-6 pt-12 sm:pt-24">
        <div class="font-bold text-sm sm:text-base">FROM THE BLOG</div>
      </div>
      {#each data.articles as article, i}
        <ArticleTeaser {article} firstEntry={i === 0} />
      {/each}
    </div>
  </NotEditable>
{/if}

<!-- Bio -->
<div id="contact" class="bg-white border-t-2 border-b-2 border-gray-100 pb-12 sm:pb-24">
  <div class="max-w-(--breakpoint-md) mx-auto px-6">
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
    <div class="prose md:prose-xl pb-6">
      <RichText multiLine bind:content={bio} />
    </div>

    <NotEditable>
      <div class="flex flex-col sm:flex-row sm:space-x-6 md:space-x-8 space-y-4 sm:space-y-0">
        <PrimaryButton size="lg" href={`mailto:${EMAIL}`}>Email</PrimaryButton>
        <!-- Removed WhatsApp button as phone number is no longer present -->
      </div>
    </NotEditable>
  </div>
</div>

<!-- FAQs -->
<div class="bg-white">
  <div class="max-w-(--breakpoint-md) mx-auto px-6">
    <div class="font-bold text-sm sm:text-base pt-12 sm:pt-24 -mb-6 md:-mb-12">FAQs</div>
    <div class="prose md:prose-xl pb-12 sm:pb-24">
      <RichText multiLine bind:content={faqs} />
    </div>
  </div>
</div>

<Footer counter="/" />
