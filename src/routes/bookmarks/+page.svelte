<script>
  import Footer from '$lib/components/Footer.svelte';
  import PlainText from '$lib/components/PlainText.svelte';
  import RichText from '$lib/components/RichText.svelte';
  import LoginMenu from '$lib/components/LoginMenu.svelte';
  import PrimaryButton from '$lib/components/PrimaryButton.svelte';
  import WebsiteHeader from '$lib/components/WebsiteHeader.svelte';
  import { fetchJSON, extractTeaser } from '$lib/util';
  import { currentUser, isEditing } from '$lib/stores.js';

  let { data } = $props();

  let showUserMenu = $state(false);
  let title = $derived(data.page?.title || 'My Bookmarks');
  let introContent = $derived(data.page?.introContent || ''); // Optional intro text for the page
  let bookmarks = $derived(data.page?.bookmarks || []); // Array of bookmarks, each with title, url, description

  $currentUser = data.currentUser;

  function toggleEdit() {
    $isEditing = true;
    showUserMenu = false;
  }

  function addBookmark() {
    bookmarks.push({
      title: 'New Bookmark Title',
      url: '',
      description: ''
    });
    bookmarks = [...bookmarks]; // Trigger reactivity
  }

  function removeBookmark(index) {
    bookmarks.splice(index, 1);
    bookmarks = [...bookmarks]; // Trigger reactivity
  }

  async function savePage() {
    if (!$currentUser) return; // Not authorized, do nothing
    try {
      await fetchJSON('POST', '/api/save-page', {
        pageId: 'bookmarks',
        page: {
          title,
          introContent,
          bookmarks // Changed from 'links' to 'bookmarks'
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
    introContent ? extractTeaser(introContent, 160) : 'A compilation of useful bookmarks and resources.'
  );
  const pageUrl = $derived(`https://blog.bnei.dev/bookmarks`);
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={pageDescription} />
  <link rel="canonical" href={pageUrl} />
  <meta property="og:type" content="website" />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={pageDescription} />
  <meta property="og:url" content={pageUrl} />
  <meta property="og:image" content="https://blog.bnei.dev/images/default-bookmark-image.jpg" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title} />
  <meta property="twitter:description" content={pageDescription} />
  <meta
    property="twitter:image"
    content="https://blog.bnei.dev/images/default-bookmark-image.jpg"
  />
</svelte:head>

<WebsiteHeader bind:showUserMenu save={savePage}>
  <PrimaryButton on:click={toggleEdit}>Edit page</PrimaryButton>
  <LoginMenu />
</WebsiteHeader>

<div class="py-12 sm:py-24">
  <div class="max-w-(--breakpoint-lg) mx-auto px-6 md:text-xl">
    <a href="/api/raw/bookmarks" class="btn btn-sm">
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
        <PrimaryButton on:click={addBookmark}>Add Bookmark</PrimaryButton>
      </div>
    {/if}

    <div class="space-y-8">
      {#each bookmarks as bookmark, index}
        <div class="border p-4 rounded-lg shadow-sm">
          {#if $isEditing}
            <div class="flex justify-end">
              <button on:click={() => removeBookmark(index)} class="btn btn-sm btn-error">
                Remove
              </button>
            </div>
            <div class="mb-4">
              <label for="bookmark-title-{index}" class="block text-sm font-medium text-gray-700"
                >Title</label
              >
              <PlainText
                id="bookmark-title-{index}"
                bind:content={bookmark.title}
                class="mt-1 block w-full"
              />
            </div>
            <div class="mb-4">
              <label for="bookmark-url-{index}" class="block text-sm font-medium text-gray-700"
                >URL</label
              >
              <PlainText
                id="bookmark-url-{index}"
                bind:content={bookmark.url}
                class="mt-1 block w-full"
              />
            </div>
            <div class="mb-4">
              <label
                for="bookmark-description-{index}"
                class="block text-sm font-medium text-gray-700"
                >Description</label
              >
              <PlainText
                id="bookmark-description-{index}"
                bind:content={bookmark.description}
                class="mt-1 block w-full"
                multiLine={true}
              />
            </div>
          {:else}
            <h2 class="text-2xl font-semibold mb-2">{bookmark.title}</h2>
            {#if bookmark.url}
              <p class="mb-2">
                <a href={bookmark.url} target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">
                  {bookmark.url}
                </a>
              </p>
            {/if}
            {#if bookmark.description}
              <p class="text-gray-700">{bookmark.description}</p>
            {/if}
          {/if}
        </div>
      {/each}
    </div>
  </div>
</div>

<Footer counter="/bookmarks" />
