<script>
  import { goto } from '$app/navigation';
  import PrimaryButton from '$lib/components/PrimaryButton.svelte';
  import LoginMenu from '$lib/components/LoginMenu.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import WebsiteHeader from '$lib/components/WebsiteHeader.svelte';
  import { formatDate } from '$lib/util';

  let { data } = $props();
  let showUserMenu = $state(false);
  let searchQuery = $state('');

  function createNewPost() {
    goto('/linkedin-posts/new');
  }

  const filteredPosts = $derived(
    data.linkedinPosts.filter(post =>
      post.article_slug.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
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
    <input
      type="text"
      placeholder="Search by article slug..."
      class="mt-4 p-2 border rounded-md w-full"
      bind:value={searchQuery}
    />
    {#if filteredPosts.length === 0}
      <div class="md:text-xl py-4">No LinkedIn posts found matching your search.</div>
    {:else}
      <div class="mt-4 grid gap-4">
        {#each filteredPosts as post}
          <a
            href="/linkedin-posts/{post.id}"
            class="block p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow"
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
                    class="text-blue-600 hover:underline">{post.linkedin_url}</a
                  >
                </p>
              {/if}
            </div>
          </a>
        {/each}
      </div>
    {/if}
  </div>
</div>

<Footer />
