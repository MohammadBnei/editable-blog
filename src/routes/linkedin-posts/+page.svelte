<script>
  import { goto } from '$app/navigation';
  import PrimaryButton from '$lib/components/PrimaryButton.svelte';
  import LoginMenu from '$lib/components/LoginMenu.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import WebsiteHeader from '$lib/components/WebsiteHeader.svelte';
  import { formatDate, fetchJSON } from '$lib/util'; // Import fetchJSON
  import { isEditing } from '$lib/stores';

  let { data } = $props();
  let linkedinPosts = $derived(data.linkedinPosts);
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

  function toggleEdit() {
    $isEditing = true;
    showUserMenu = false;
  }

  async function deletePost(postId) {
    try {
      await fetchJSON('POST', `/api/linkedin-posts/${postId}/delete`);
      // Refresh the page data after deletion
      linkedinPosts = linkedinPosts.filter(post => post.id !== postId);
    } catch (err) {
      console.error(err);
      alert('Error deleting the LinkedIn post.');
    }
  }

  const filteredAndSortedPosts = $derived.by(() => {
    let posts = linkedinPosts;

    // Apply search filter
    if (searchQuery) {
      posts = posts.filter(
        post =>
          post.article_slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.post.toLowerCase().includes(searchQuery.toLowerCase())
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
    <PrimaryButton type="button" on:click={toggleEdit}>Edit Posts</PrimaryButton>
    <LoginMenu />
  </div>
</WebsiteHeader>

<div class="pb-8">
  <div class="max-w-(--breakpoint-lg) mx-auto px-6 pt-12 sm:pt-24">
    <div class="font-bold text-sm">Linkedin Posts</div>
    <div class="mt-4 flex flex-wrap gap-2">
      <input
        type="text"
        placeholder="Search by article slug or content..."
        class="input input-bordered w-full"
        bind:value={searchQuery}
      />

      <select bind:value={validatedFilter} class="select w-fit bg-base-100">
        <option value="all">All Validated Statuses</option>
        <option value="validated">Validated</option>
        <option value="not_validated">Not Validated</option>
      </select>

      <select bind:value={publishedFilter} class="select w-fit">
        <option value="all">All Published Statuses</option>
        <option value="published">Published</option>
        <option value="not_published">Not Published</option>
      </select>

      <select bind:value={sortBy} class="select w-fit">
        <option value="updated_at_desc">Last Updated (Newest First)</option>
        <option value="updated_at_asc">Last Updated (Oldest First)</option>
        <option value="created_at_desc">Created (Newest First)</option>
        <option value="created_at_asc">Created (Oldest First)</option>
      </select>
    </div>
    <button on:click={resetFilters} class="btn mt-4"> Reset Filters </button>

    {#if filteredAndSortedPosts.length === 0}
      <div class="md:text-xl py-4">No LinkedIn posts found matching your criteria.</div>
    {:else}
      <div class="mt-4 grid gap-4">
        {#each filteredAndSortedPosts as post}
          <div
            on:click={() => !$isEditing && goto(`/linkedin-posts/${post.id}`)}
            on:keydown={e => {
              if (!$isEditing && e.key === 'Enter') goto(`/linkedin-posts/${post.id}`);
            }}
            role="link"
            tabindex="0"
            class="block p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow {$isEditing
              ? ''
              : 'cursor-pointer'}"
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
            </div>
            {#if $isEditing}
              <button on:click={() => deletePost(post.id)} class="btn btn-error btn-sm mt-2">
                Delete
              </button>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<Footer />
