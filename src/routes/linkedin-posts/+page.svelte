<script>
  import { goto } from '$app/navigation';
  import PrimaryButton from '$lib/components/PrimaryButton.svelte';
  import LoginMenu from '$lib/components/LoginMenu.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import WebsiteHeader from '$lib/components/WebsiteHeader.svelte';
  import { formatDate } from '$lib/util';

  let { data } = $props();
  let showUserMenu = $state(false);

  function createNewPost() {
    goto('/linkedin-posts/new');
  }
</script>

<svelte:head>
  <title>LinkedIn Posts</title>
  <meta name="description" content="Manage your LinkedIn posts." />
</svelte:head>

<WebsiteHeader bind:showUserMenu>
  <div class="w-full flex flex-col space-y-4 p-4 sm:p-6">
    <PrimaryButton type="button" on:click={createNewPost}>New LinkedIn Post</PrimaryButton>
    <LoginMenu />
  </div>
</WebsiteHeader>

<div class="pb-8">
  <div class="max-w-(--breakpoint-md) mx-auto px-6 pt-12 sm:pt-24">
    <div class="font-bold text-sm">LINKEDIN POSTS</div>
    {#if data.linkedinPosts.length === 0}
      <div class="md:text-xl py-4">No LinkedIn posts have been created so far.</div>
    {:else}
      <div class="mt-4 grid gap-4">
        {#each data.linkedinPosts as post}
          <a
            href="/linkedin-posts/{post.id}"
            class="block p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 class="text-lg font-semibold">{post.article_slug}</h3>
            <p class="text-gray-700 line-clamp-2 my-2">{post.post}</p>
            <div class="text-sm text-gray-500 mt-2">
              <p>Status: {post.validated ? 'Validated' : 'Not Validated'}</p>
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
