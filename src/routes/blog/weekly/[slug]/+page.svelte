<script>
  import BlogPost from '$lib/components/BlogPost.svelte';

  let { data } = $props();
  let { post } = $derived(data);
</script>

<svelte:head>
  <title>{post.metadata.title}</title>
</svelte:head>

<a
  href="/blog/weekly"
  class="mb-8 inline-flex items-center gap-1 font-mono text-sm font-medium text-base-content/60 transition-colors hover:text-primary"
>
  <span aria-hidden="true">&larr;</span> Back to rundowns
</a>

<BlogPost {post} />
