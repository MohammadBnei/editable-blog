<script>
  import { extractTeaser, fetchJSON } from '$lib/util';
  import { goto } from '$app/navigation';
  import Footer from '$lib/components/Footer.svelte';
  import EditableWebsiteTeaser from '$lib/components/EditableWebsiteTeaser.svelte';
  import Article from '$lib/components/Article.svelte';
  import NotEditable from '$lib/components/NotEditable.svelte';
  import { currentUser, isEditing } from '$lib/stores';
  import WebsiteHeader from '$lib/components/WebsiteHeader.svelte';

  export let data;

  let showUserMenu = false,
    title = 'Untitled',
    content = '# Your Markdown Title\n\nStart writing your content here using Markdown syntax.\n\n## Subheading\n\n- Bullet point 1\n- Bullet point 2\n\n**Bold text** and *italic text*.\n\n```js\n// Code block\nconsole.log("Hello world!");\n```';

  $: {
    $currentUser = data.currentUser;
    $isEditing = true;
  }

  async function createArticle() {
    if (!$currentUser) {
      return alert('Sorry, you are not authorized to create new articles.');
    }
    
    const teaser = extractTeaser(content);
    try {
      const { slug } = await fetchJSON('POST', '/api/create-article', {
        title,
        content,
        teaser
      });
      goto(`/blog/${slug}`);
    } catch (err) {
      console.error(err);
      alert('A document with that title has already been published. Choose a different title.');
    }
  }

  async function discardDraft() {
    goto('/blog');
  }
</script>

<svelte:head>
  <title>New blog post</title>
</svelte:head>

<WebsiteHeader bind:showUserMenu cancel={discardDraft} save={createArticle} />

<Article bind:title bind:content />

<NotEditable>
  <EditableWebsiteTeaser />
</NotEditable>

<Footer counter="/blog/new" />
