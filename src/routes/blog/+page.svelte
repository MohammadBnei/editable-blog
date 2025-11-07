<script>
  import { goto } from '$app/navigation';
  import PrimaryButton from '$lib/components/PrimaryButton.svelte';
  import LoginMenu from '$lib/components/LoginMenu.svelte';
  import ArticleTeaser from '$lib/components/ArticleTeaser.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import EditableWebsiteTeaser from '$lib/components/EditableWebsiteTeaser.svelte';
  import WebsiteHeader from '$lib/components/WebsiteHeader.svelte';

  let { data } = $props();
  let showUserMenu = $state(false);
</script>

<svelte:head>
  <title>Blog</title>
  <meta name="description" content="What you always wanted to know about web development." />
</svelte:head>

<WebsiteHeader bind:showUserMenu>
  <div class="w-full flex flex-col space-y-4 p-4 sm:p-6">
    <PrimaryButton type="button" on:click={() => goto('/blog/new')}>New blog post</PrimaryButton>
    <LoginMenu />
  </div>
</WebsiteHeader>

<div class="pb-8">
  <div class="max-w-(--breakpoint-lg) mx-auto px-6 pt-12 sm:pt-24">
    <a href="/api/raw/blog" class="btn btn-sm">
      <svg xmlns="http://www.w3.org/2000/svg" height="1.3em" viewBox="0 0 25 25">
        <path
          fill="currentColor"
          d="M18.92 6.05a.75.75 0 0 0-.598-.297L9.327 5.75a.75.75 0 1 0 0 1.5l7.19.002l-10.72 10.72a.75.75 0 0 0 1.061 1.06L17.573 8.318l.002 7.177a.75.75 0 0 0 1.5-.001l-.003-8.933a.75.75 0 0 0-.152-.51"
        />
      </svg>
      markdown
    </a>
    <div class="font-bold text-sm">LATEST ARTICLES</div>
    {#if data.articles.length === 0}
      <div class="md:text-xl py-4">No blog posts have been published so far.</div>
    {/if}
  </div>

  {#each data.articles as article, i}
    <ArticleTeaser {article} firstEntry={i === 0} />
  {/each}
</div>

<EditableWebsiteTeaser />

<Footer counter="/blog" />
