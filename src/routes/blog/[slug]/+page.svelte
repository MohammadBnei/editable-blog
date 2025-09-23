<script>
  import { extractTeaser, fetchJSON } from '$lib/util';
  import PrimaryButton from '$lib/components/PrimaryButton.svelte';
  import WebsiteNav from '$lib/components/WebsiteNav.svelte';
  import Modal from '$lib/components/Modal.svelte';
  import LoginMenu from '$lib/components/LoginMenu.svelte';
  import { goto } from '$app/navigation';
  import Footer from '$lib/components/Footer.svelte';
  import ArticleTeaser from '$lib/components/ArticleTeaser.svelte';
  import EditableWebsiteTeaser from '$lib/components/EditableWebsiteTeaser.svelte';
  import Article from '$lib/components/Article.svelte';
  import NotEditable from '$lib/components/NotEditable.svelte';
  import EditorToolbar from '$lib/components/tools/EditorToolbar.svelte';
  import { currentUser, isEditing } from '$lib/stores';

  let { data } = $props();

  let { showUserMenu, title, teaser, content, published_at, updatedAt } = $state({
    showUserMenu: false,
    title: data.title,
    teaser: data.teaser,
    content: data.content,
    published_at: data.published_at,
    updatedAt: data.updatedAt
  });

  $effect(() => {
    $currentUser = data.currentUser;
    initOrReset();
  });

  function initOrReset() {
    title = data.title;
    teaser = data.teaser;
    content = data.content;
    published_at = data.published_at;
    updatedAt = data.updatedAt;
    $isEditing = false;
  }

  function toggleEdit() {
    $isEditing = true;
    showUserMenu = false;
  }

  async function deleteArticle() {
    if (!$currentUser) return alert('Sorry, you are not authorized.');
    try {
      fetchJSON('POST', '/api/delete-article', {
        slug: data.slug
      });
      goto('/blog');
    } catch (err) {
      console.error(err);
      alert('Error deleting the article. Try again.');
      window.location.reload();
    }
  }

  async function saveArticle() {
    if (!$currentUser) return alert('Sorry, you are not authorized.');
    const teaser = extractTeaser(content);
    try {
      const result = await fetchJSON('POST', '/api/update-article', {
        slug: data.slug,
        title,
        content,
        teaser
      });
      updatedAt = result.updatedAt;
      $isEditing = false;
    } catch (err) {
      console.error(err);
      alert(
        'There was an error. You can try again, but before that, please just copy and paste your article into a safe place.'
      );
    }
  }

  async function togglePublishedStatus() {
    if (!$currentUser) return alert('Sorry, you are not authorized.');
    try {
      const publish = !published_at; // If published_at exists, we want to unpublish, otherwise publish
      const result = await fetchJSON('POST', '/api/set-published-at', {
        slug: data.slug,
        publish: publish
      });
      published_at = result.published_at;
      updatedAt = result.updatedAt;
    } catch (err) {
      console.error(err);
      alert('Error updating published status. Please try again.');
    }
  }

  async function triggerN8nWebhook() {
    if (!$currentUser) return alert('Sorry, you are not authorized.');
    try {
      await fetchJSON('POST', '/api/linkedin-posts/trigger-n8n', {
        slug: data.slug,
        lang: data.lang // Assuming data.lang is available from the page data
      });
      alert('N8N webhook triggered successfully!');
    } catch (err) {
      console.error(err);
      alert('Error triggering N8N webhook. Please check the console for details.');
    }
  }

  // Extract image from content for OG image
  const ogImage = $derived(
    (content?.match(/<img src="([^"]+)"/) || [])?.[1] || '/images/default-blog-image.jpg'
  );
  const articleUrl = $derived(`https://blog.bnei.dev/blog/${data.slug}`);
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={teaser} />
  <link rel="canonical" href={articleUrl} />
  <meta property="og:type" content="article" />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={teaser} />
  <meta property="og:url" content={articleUrl} />
  <meta property="og:image" content="https://blog.bnei.dev{ogImage}" />
  <meta property="article:published_time" content={published_at} />
  {#if updatedAt}
    <meta property="article:modified_time" content={updatedAt} />
  {/if}

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={teaser} />
  <meta name="twitter:image" content="https://blog.bnei.dev{ogImage}" />
</svelte:head>

<EditorToolbar cancel={initOrReset} save={saveArticle} />
<WebsiteNav bind:showUserMenu />
{#if showUserMenu}
  <Modal on:close={() => (showUserMenu = false)}>
    <form class="w-full block" method="POST">
      <div class="w-full flex flex-col space-y-4 p-4 sm:p-6 gap-0.5">
        <PrimaryButton on:click={toggleEdit}>Edit post</PrimaryButton>
        <PrimaryButton type="button" on:click={deleteArticle}>Delete post</PrimaryButton>
        {#if $currentUser}
          <PrimaryButton type="button" on:click={togglePublishedStatus}>
            {published_at ? 'Unpublish post' : 'Publish post'}
          </PrimaryButton>
          <PrimaryButton type="button" on:click={triggerN8nWebhook}>
            Trigger N8N LinkedIn Post
          </PrimaryButton>
        {/if}
        <LoginMenu />
      </div>
    </form>
  </Modal>
{/if}

<Article bind:title bind:content bind:published_at />

{#if data.articles.length > 0}
  <NotEditable>
    <div class="border-t-2 border-gray-100">
      <div class="max-w-(--breakpoint-md) mx-auto px-6 pt-8 sm:pt-12">
        <div class="font-bold text-sm">READ NEXT</div>
      </div>
      {#each data.articles as article, i}
        <ArticleTeaser {article} firstEntry={i === 0} />
      {/each}
    </div>
  </NotEditable>
{/if}

<NotEditable>
  <EditableWebsiteTeaser />
</NotEditable>

<Footer counter={`/blog/${data.slug}`} />
