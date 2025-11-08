<script>
  import Footer from '$lib/components/Footer.svelte';
  import PlainText from '$lib/components/PlainText.svelte';
  import RichText from '$lib/components/RichText.svelte';
  import LoginMenu from '$lib/components/LoginMenu.svelte';
  import PrimaryButton from '$lib/components/PrimaryButton.svelte';
  import WebsiteHeader from '$lib/components/WebsiteHeader.svelte';
  // Removed BookmarkSeoCard import
  import { fetchJSON, extractTeaser } from '$lib/util';
  import { currentUser, isEditing } from '$lib/stores.js';
  import Sortable from 'sortablejs'; // Import SortableJS

  let { data } = $props();

  let showUserMenu = $state(false);
  let title = $derived(data.page?.title || 'My Bookmarks');
  let introContent = $derived(data.page?.introContent || ''); // Optional intro text for the page
  let bookmarks = $derived(data.page?.bookmarks || []); // Array of bookmarks, each with title, url, description

  $currentUser = data.currentUser;

  let bookmarkListElement; // Reference to the ul element for SortableJS

  $effect(() => {
    if (bookmarkListElement && $isEditing) {
      const sortable = new Sortable(bookmarkListElement, {
        animation: 150,
        handle: '.drag-handle', // Drag handle class
        onEnd: (evt) => {
          const { oldIndex, newIndex } = evt;
          if (oldIndex !== newIndex) {
            const [movedItem] = bookmarks.splice(oldIndex, 1);
            bookmarks.splice(newIndex, 0, movedItem);
            bookmarks = [...bookmarks]; // Trigger reactivity
          }
        }
      });
      return () => sortable.destroy();
    }
  });

  function toggleEdit() {
    $isEditing = true;
    showUserMenu = false;
  }

  function addBookmark() {
    bookmarks.unshift({
      title: 'New Bookmark Title',
      url: '',
      description: '',
      // Removed metadata property
    });
    bookmarks = [...bookmarks]; // Trigger reactivity
  }

  function removeBookmark(index) {
    bookmarks.splice(index, 1);
    bookmarks = [...bookmarks]; // Trigger reactivity
  }

  function moveBookmark(index, direction) {
    if (direction === 'up' && index > 0) {
      [bookmarks[index - 1], bookmarks[index]] = [bookmarks[index], bookmarks[index - 1]];
    } else if (direction === 'down' && index < bookmarks.length - 1) {
      [bookmarks[index + 1], bookmarks[index]] = [bookmarks[index], bookmarks[index + 1]];
    }
    bookmarks = [...bookmarks]; // Trigger reactivity
  }

  // Removed fetchBookmarkMetadata function

  async function savePage() {
    if (!$currentUser) return; // Not authorized, do nothing
    try {
      await fetchJSON('POST', '/api/save-page', {
        pageId: 'bookmarks',
        page: {
          title,
          introContent,
          bookmarks
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

    <ul class="list bg-base-100 rounded-box shadow-md" bind:this={bookmarkListElement}>
      {#each bookmarks as bookmark, index (bookmark)}
        <li class="list-row group relative">
          {#if $isEditing}
            <div class="flex items-center gap-2">
              <button class="btn btn-ghost btn-sm drag-handle cursor-grab" title="Drag to reorder">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
                </svg>
              </button>
              <button on:click={() => moveBookmark(index, 'up')} disabled={index === 0} class="btn btn-ghost btn-sm" title="Move up">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd" />
                </svg>
              </button>
              <button on:click={() => moveBookmark(index, 'down')} disabled={index === bookmarks.length - 1} class="btn btn-ghost btn-sm" title="Move down">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          {/if}

          <div class="flex-1 min-w-0">
            {#if $isEditing}
              <div class="mb-2">
                <label for="bookmark-title-{index}" class="sr-only">Title</label>
                <PlainText
                  id="bookmark-title-{index}"
                  bind:content={bookmark.title}
                  class="input input-bordered w-full input-sm"
                  placeholder="Bookmark Title"
                />
              </div>
              <div class="mb-2">
                <label for="bookmark-url-{index}" class="sr-only">URL</label>
                <PlainText
                  id="bookmark-url-{index}"
                  bind:content={bookmark.url}
                  class="input input-bordered w-full input-sm"
                  placeholder="https://example.com"
                />
              </div>
              <div class="mb-2">
                <label for="bookmark-description-{index}" class="sr-only">Description</label>
                <PlainText
                  id="bookmark-description-{index}"
                  bind:content={bookmark.description}
                  class="textarea textarea-bordered w-full textarea-sm"
                  placeholder="Description (optional)"
                  multiLine={true}
                />
              </div>
              <div class="flex gap-2">
                <!-- Removed Fetch SEO button -->
                <button on:click={() => removeBookmark(index)} class="btn btn-sm btn-error">
                  Remove
                </button>
              </div>
            {:else}
              <h2 class="text-lg font-semibold">
                {#if bookmark.url}
                  <a href={bookmark.url} target="_blank" rel="noopener noreferrer" class="link link-hover">
                    {bookmark.title || bookmark.url}
                  </a>
                {:else}
                  {bookmark.title || 'Untitled Bookmark'}
                {/if}
              </h2>
              {#if bookmark.url}
                <p class="text-sm opacity-70 truncate">{bookmark.url}</p>
              {/if}
              {#if bookmark.description}
                <p class="text-sm text-gray-700">{bookmark.description}</p>
              {/if}
            {/if}
          </div>

          <!-- Removed metadata display logic -->
        </li>
      {/each}
    </ul>
  </div>
</div>

<Footer counter="/bookmarks" />
