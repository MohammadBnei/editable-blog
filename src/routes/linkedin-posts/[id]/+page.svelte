<script>
  import PlainText from '$lib/components/PlainText.svelte';
  import EditableWebsiteTeaser from '$lib/components/EditableWebsiteTeaser.svelte';
  import NotEditable from '$lib/components/NotEditable.svelte';
  import { fetchJSON, formatDate } from '$lib/util';
  import PrimaryButton from '$lib/components/PrimaryButton.svelte';
  import WebsiteHeader from '$lib/components/WebsiteHeader.svelte';
  import LoginMenu from '$lib/components/LoginMenu.svelte';
  import { goto } from '$app/navigation';
  import Footer from '$lib/components/Footer.svelte';
  import { isEditing } from '$lib/stores';

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
</script>

<WebsiteHeader bind:showUserMenu cancel={initOrReset} save={savePost}>
  <div class="w-full flex flex-col space-y-4 p-4 sm:p-6 gap-0.5">
    <PrimaryButton on:click={toggleEdit}>Edit Post</PrimaryButton>
    <PrimaryButton type="button" on:click={deletePost}>Delete Post</PrimaryButton>
    <LoginMenu />
  </div>
</WebsiteHeader>
<div class="max-w-(--breakpoint-lg) mx-auto px-6 pt-12 sm:pt-24 pb-8">
  <h1 class="text-xl font-bold mb-4">{article_slug}</h1>

  <div class="my-6">
    <PlainText bind:content={post} />
  </div>
  <ul class="list rounded-box shadow-md mt-4">
    <li class="list-row flex items-center justify-between p-4">
      <strong class="mr-1">Lang:</strong>
      <span>{lang}</span>
    </li>
    <li class="list-row flex items-center justify-between p-4">
      <strong class="mr-1">Validated:</strong>
      <span>{validated ? 'Yes' : 'No'}</span>
      {#if $isEditing}
        <button
          on:click={toggleValidationStatus}
          class="btn rounded-sm {validated
            ? 'bg-yellow-200 text-yellow-800'
            : 'bg-green-200 text-green-800'}"
        >
          {validated ? 'Unvalidate' : 'Validate'}
        </button>
      {/if}
    </li>
    <li class="list-row flex items-center justify-between p-4">
      <strong class="mr-1">Published At:</strong>
      <span>{published_at ? formatDate(published_at, true) : 'Not Published'}</span>
      {#if $isEditing}
        <button
          on:click={togglePublishedStatus}
          class="btn rounded-sm {published_at
            ? 'bg-red-200 text-red-800'
            : 'bg-blue-200 text-blue-800'}"
        >
          {published_at ? 'Unpublish' : 'Publish'}
        </button>
      {/if}
    </li>
    {#if linkedin_url}
      <li class="list-row flex items-center justify-between p-4">
        <strong class="mr-1">LinkedIn URL:</strong>
        <a
          href={linkedin_url}
          target="_blank"
          rel="noopener noreferrer"
          class="text-blue-600 hover:underline">{linkedin_url}</a
        >
      </li>
    {/if}
    <li class="list-row flex items-center justify-between p-4">
      <strong class="mr-1">Created At:</strong>
      <span>{formatDate(created_at, true)}</span>
    </li>
    <li class="list-row flex items-center justify-between p-4">
      <strong class="mr-1">Last Updated:</strong>
      <span>{formatDate(updated_at, true)}</span>
    </li>
  </ul>
</div>

{#if data.nextLinkedInPost || data.previousLinkedInPost}
  <NotEditable>
    <div class="border-t-2 border-gray-100 py-8 sm:py-12">
      <div class="max-w-(--breakpoint-lg) mx-auto px-6 flex justify-between">
        {#if data.previousLinkedInPost}
          <a
            href="/linkedin-posts/{data.previousLinkedInPost.id}"
            class="btn btn-outline"
            >← Previous Post</a
          >
        {:else}
          <div />
        {/if}
        {#if data.nextLinkedInPost}
          <a href="/linkedin-posts/{data.nextLinkedInPost.id}" class="btn btn-outline"
            >Next Post →</a
          >
        {/if}
      </div>
    </div>
  </NotEditable>
{/if}

<NotEditable>
  <EditableWebsiteTeaser />
</NotEditable>

<Footer />
