<script>
  import { goto } from '$app/navigation';
  import PrimaryButton from '$lib/components/PrimaryButton.svelte';
  import LoginMenu from '$lib/components/LoginMenu.svelte';
  import Footer from '$lib/components/Footer';
  import WebsiteHeader from '$lib/components/WebsiteHeader.svelte';
  import { formatDate } from '$lib/util';

  let { data } = $props();
  let showUserMenu = $state(false);
  let searchQuery = $state('');
  let validatedFilter = $state('all'); // 'all', 'validated', 'not_validated'
  let publishedFilter = $state('all'); // 'all', 'published', 'not_published'
  let sortBy = $state('updated_at_desc'); // 'created_at_asc', 'created_at_desc', 'updated_at_asc', 'updated_at_desc'

  function createNewPost() {
    goto('/linkedin-posts/new');
  }

  function resetFilters() {
    searchQuery = '';
    validatedFilter = 'all';
    publishedFilter = 'all';
    sortBy = 'updated_at_desc';
  }

  const filteredAndSortedPosts = $derived(() => {
    let posts = data.linkedinPosts;

    // Apply search filter
    if (searchQuery) {
      posts = posts.filter(post =>
        post.article_slug.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply validated filter
    if (validatedFilter === 'validated') {
      posts = posts.filter(post => post.validated);
    } else if (validatedFilter === 'not_validated') {
      posts = posts.filter(post => !post.validated);
    }

    // Apply published filter
    if (publishedFilter === 'published') {
      posts = posts.filter(post => post.published_at);
    } else if (publishedFilter === 'not_published') {
      posts = posts.filter(post => !post.published_at);
    }

    // Apply sort
    posts.sort((a, b) => {
      let dateA, dateB;
      if (sortBy.startsWith('created_at')) {
        dateA = new Date(a.created_at);
        dateB = new Date(b.created_at);
      } else {
        dateA = new Date(a.updated_at);
        dateB = new Date(b.updated_at);
      }

      if (sortBy.endsWith('_asc')) {
        return dateA.getTime() - dateB.getTime();
      } else {
        return dateB.getTime() - dateA.getTime();
      }
    });

    return posts;
  });
</script>

<WebsiteHeader bind:showUserMenu>
  <div class="w-full flex flex-col space-y-4 p-4 sm:p-6">
    <PrimaryButton type="button" on:click={createNewPost}>New LinkedIn Post</PrimaryButton>
    <LoginMenu />
  </div>
</WebsiteHeader>

<div class="pb-8">
  <div class="max-w-(--breakpoint-md) mx-auto px-6 pt-12 sm:pt-24">
    <div class="font-bold text-sm">Linkedin Posts</div>
    <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <input
        type="text"
        placeholder="Search by article slug..."
        class="p-2 border rounded-md w-full"
        bind:value={searchQuery}
      />

      <select bind:value={validatedFilter} class="p-2 border rounded-md w-full">
        <option value="all">All Validated Statuses</option>
        <option value="validated">Validated</option>
        <option value="not_validated">Not Validated</option>
      </select>

      <select bind:value={publishedFilter} class="p-2 border rounded-md w-full">
        <option value="all">All Published Statuses</option>
        <option value="published">Published</option>
        <option value="not_published">Not Published</option>
      </select>

      <select bind:value={sortBy} class="p-2 border rounded-md w-full">
        <option value="updated_at_desc">Last Updated (Newest First)</option>
        <option value="updated_at_asc">Last Updated (Oldest First)</option>
        <option value="created_at_desc">Created (Newest First)</option>
        <option value="created_at_asc">Created (Oldest First)</option>
      </select>
    </div>
    <button on:click={resetFilters} class="mt-4 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">
      Reset Filters
    </button>

    {#if filteredAndSortedPosts.length === 0}
      <div class="md:text-xl py-4">No LinkedIn posts found matching your criteria.</div>
    {:else}
      <div class="mt-4 grid gap-4">
        {#each filteredAndSortedPosts as post}
          <div
            on:click={() => goto(`/linkedin-posts/${post.id}`)}
            on:keydown={(e) => { if (e.key === 'Enter') goto(`/linkedin-posts/${post.id}`); }}
            role="link"
            tabindex="0"
            class="block p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <h3 class="text-lg font-semibold">{post.article_slug}</h3>
            <p class="text-gray-700 line-clamp-2 my-2">{post.post}</p>
            <div class="text-sm text-gray-500 mt-2">
              <p>{post.validated ? 'Validated' : 'Not Validated'}</p>
              {#if post.published_at}
                <p>Published: {formatDate(post.published_at, true)}</p>
              {:else}
                <p>Not Published</p>
              {/if}
              {#if post.linkedin_url}
                <p>
                  LinkedIn URL: <a
                    href={post.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-blue-600 hover:underline"
                    on:click|stopPropagation
                    on:keydown|stopPropagation
                    >{post.linkedin_url}</a
                  >
                </p>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<Footer />
