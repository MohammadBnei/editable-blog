<script>
  import { fetchJSON } from '$lib/util';
  import { goto } from '$app/navigation';
  import Footer from '$lib/components/Footer.svelte';
  import WebsiteHeader from '$lib/components/WebsiteHeader.svelte';
  import { currentUser, isEditing } from '$lib/stores';
  import LoginMenu from '$lib/components/LoginMenu.svelte';
  import PrimaryButton from '$lib/components/PrimaryButton.svelte';
  import Modal from '$lib/components/Modal.svelte';
  import EditorToolbar from '$lib/components/tools/EditorToolbar.svelte';

  let { data } = $props();

  let showUserMenu = $state(false);
  let article_slug = $state('');
  let post = $state('');
  let lang = $state(data.lang || 'en'); // Default to 'en' or use loaded lang

  $effect(() => {
    $currentUser = data.currentUser;
    $isEditing = true; // Always in editing mode when creating a new post
  });

  function initOrReset() {
    article_slug = '';
    post = '';
    lang = data.lang || 'en';
    $isEditing = true;
  }

  async function createLinkedInPost() {
    if (!$currentUser) {
      return alert('Sorry, you are not authorized to create new LinkedIn posts.');
    }
    if (!article_slug || !post || !lang) {
      return alert('Please fill in all required fields: Article Slug, Post Content, and Language.');
    }

    try {
      const result = await fetchJSON('POST', '/api/linkedin-posts/create', {
        article_slug,
        post,
        lang
      });
      goto(`/linkedin-posts/${result.id}`);
    } catch (err) {
      console.error(err);
      alert('Error creating the LinkedIn post. Please ensure the Article Slug and Language are valid and try again.');
    }
  }

  function discardDraft() {
    goto('/linkedin-posts');
  }
</script>

<svelte:head>
  <title>New LinkedIn Post</title>
  <meta name="description" content="Create a new LinkedIn post." />
</svelte:head>

<EditorToolbar cancel={discardDraft} save={createLinkedInPost} />
<WebsiteHeader bind:showUserMenu>
  <div class="w-full flex flex-col space-y-4 p-4 sm:p-6">
    <LoginMenu />
  </div>
</WebsiteHeader>

<div class="max-w-(--breakpoint-md) mx-auto px-6 pt-12 sm:pt-24 pb-8">
  <h1 class="text-3xl font-bold mb-4">Create New LinkedIn Post</h1>

  <div class="space-y-4">
    <div>
      <label for="article-slug" class="block text-sm font-medium text-gray-700">Associated Article Slug</label>
      <input
        type="text"
        id="article-slug"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        bind:value={article_slug}
        placeholder="e.g., my-awesome-article"
      />
      <p class="mt-1 text-xs text-gray-500">This post will be linked to an existing article by its slug.</p>
    </div>
    <div>
      <label for="post-lang" class="block text-sm font-medium text-gray-700">Language (e.g., en, fr)</label>
      <input
        type="text"
        id="post-lang"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        bind:value={lang}
        maxlength="2"
        placeholder="e.g., en"
      />
    </div>
    <div>
      <label for="post-content" class="block text-sm font-medium text-gray-700">Post Content</label>
      <textarea
        id="post-content"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        rows="10"
        bind:value={post}
        placeholder="Write your LinkedIn post here..."
      ></textarea>
    </div>
  </div>
</div>

<Footer />
