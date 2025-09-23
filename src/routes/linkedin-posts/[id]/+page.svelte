<script>
  import { fetchJSON, formatDate } from '$lib/util';
  import PrimaryButton from '$lib/components/PrimaryButton.svelte';
  import WebsiteNav from '$lib/components/WebsiteNav.svelte';
  import Modal from '$lib/components/Modal.svelte';
  import LoginMenu from '$lib/components/LoginMenu.svelte';
  import { goto } from '$app/navigation';
  import Footer from '$lib/components/Footer.svelte';
  import EditorToolbar from '$lib/components/tools/EditorToolbar.svelte';
  import { currentUser, isEditing } from '$lib/stores';

  let { data } = $props();

  let {
    showUserMenu,
    id,
    article_slug,
    lang,
    post,
    published_at,
    validated,
    linkedin_url,
    created_at,
    updated_at
  } = $state({
    showUserMenu: false,
    id: data.linkedinPost.id,
    article_slug: data.linkedinPost.article_slug,
    lang: data.linkedinPost.lang,
    post: data.linkedinPost.post,
    published_at: data.linkedinPost.published_at,
    validated: data.linkedinPost.validated,
    linkedin_url: data.linkedinPost.linkedin_url,
    created_at: data.linkedinPost.created_at,
    updated_at: data.linkedinPost.updated_at
  });

  $effect(() => {
    $currentUser = data.currentUser;
    initOrReset();
  });

  function initOrReset() {
    id = data.linkedinPost.id;
    article_slug = data.linkedinPost.article_slug;
    lang = data.linkedinPost.lang;
    post = data.linkedinPost.post;
    published_at = data.linkedinPost.published_at;
    validated = data.linkedinPost.validated;
    linkedin_url = data.linkedinPost.linkedin_url;
    created_at = data.linkedinPost.created_at;
    updated_at = data.linkedinPost.updated_at;
    $isEditing = false;
  }

  function toggleEdit() {
    $isEditing = true;
    showUserMenu = false;
  }

  async function deletePost() {
    if (!$currentUser) return alert('Sorry, you are not authorized.');
    if (!confirm('Are you sure you want to delete this LinkedIn post?')) return;
    try {
      await fetchJSON('POST', `/api/linkedin-posts/${id}/delete`);
      goto('/linkedin-posts');
    } catch (err) {
      console.error(err);
      alert('Error deleting the LinkedIn post. Try again.');
      window.location.reload();
    }
  }

  async function savePost() {
    if (!$currentUser) return alert('Sorry, you are not authorized.');
    try {
      const result = await fetchJSON('POST', `/api/linkedin-posts/${id}/update`, {
        post,
        linkedin_url
      });
      updated_at = result.updated_at;
      $isEditing = false;
    } catch (err) {
      console.error(err);
      alert('There was an error saving the LinkedIn post. Please try again.');
    }
  }

  async function toggleValidationStatus() {
    if (!$currentUser) return alert('Sorry, you are not authorized.');
    try {
      const result = await fetchJSON('POST', `/api/linkedin-posts/${id}/validate`, {
        validated: !validated
      });
      validated = result.validated;
      updated_at = result.updated_at;
    } catch (err) {
      console.error(err);
      alert('Error updating validation status. Please try again.');
    }
  }

  async function togglePublishedStatus() {
    if (!$currentUser) return alert('Sorry, you are not authorized.');
    try {
      const publish = !published_at;
      const result = await fetchJSON('POST', `/api/linkedin-posts/${id}/publish`, {
        publish: publish
      });
      published_at = result.published_at;
      updated_at = result.updated_at;
    } catch (err) {
      console.error(err);
      alert('Error updating published status. Please try again.');
    }
  }

  const postUrl = $derived(`https://blog.bnei.dev/linkedin-posts/${id}`);
</script>

<svelte:head>
  <title>LinkedIn Post {id}</title>
  <meta name="description" content={post.substring(0, 160)} />
  <link rel="canonical" href={postUrl} />
</svelte:head>

<EditorToolbar cancel={initOrReset} save={savePost} />
<WebsiteNav bind:showUserMenu />
{#if showUserMenu}
  <Modal on:close={() => (showUserMenu = false)}>
    <form class="w-full block" method="POST">
      <div class="w-full flex flex-col space-y-4 p-4 sm:p-6 gap-0.5">
        <PrimaryButton on:click={toggleEdit}>Edit Post</PrimaryButton>
        <PrimaryButton type="button" on:click={deletePost}>Delete Post</PrimaryButton>
        {#if $currentUser}
          <PrimaryButton type="button" on:click={toggleValidationStatus}>
            {validated ? 'Unvalidate Post' : 'Validate Post'}
          </PrimaryButton>
          <PrimaryButton type="button" on:click={togglePublishedStatus}>
            {published_at ? 'Unpublish Post' : 'Publish Post'}
          </PrimaryButton>
        {/if}
        <LoginMenu />
      </div>
    </form>
  </Modal>
{/if}

<div class="max-w-(--breakpoint-md) mx-auto px-6 pt-12 sm:pt-24 pb-8">
  <h1 class="text-3xl font-bold mb-4">LinkedIn Post #{id}</h1>

  {#if $isEditing}
    <div class="space-y-4">
      <div>
        <label for="post-content" class="block text-sm font-medium text-gray-700">Post Content</label>
        <textarea
          id="post-content"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          rows="10"
          bind:value={post}
        ></textarea>
      </div>
      <div>
        <label for="linkedin-url" class="block text-sm font-medium text-gray-700">LinkedIn URL</label>
        <input
          type="text"
          id="linkedin-url"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          bind:value={linkedin_url}
        />
      </div>
    </div>
  {:else}
    <div class="prose max-w-none">
      <p class="whitespace-pre-wrap">{post}</p>
      <p><strong>Article Slug:</strong> {article_slug}</p>
      <p><strong>Language:</strong> {lang}</p>
      <p><strong>Validated:</strong> {validated ? 'Yes' : 'No'}</p>
      <p><strong>Published At:</strong> {published_at ? formatDate(published_at, true) : 'Not Published'}</p>
      {#if linkedin_url}
        <p><strong>LinkedIn URL:</strong> <a href={linkedin_url} target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">{linkedin_url}</a></p>
      {/if}
      <p><strong>Created At:</strong> {formatDate(created_at, true)}</p>
      <p><strong>Last Updated:</strong> {formatDate(updated_at, true)}</p>
    </div>
  {/if}
</div>

<Footer />
