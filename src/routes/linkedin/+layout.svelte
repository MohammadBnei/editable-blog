<script>
  let { children } = $props();
</script>

<svelte:head>
  <!-- Belt and braces with the sitemap/robots exclusions in scripts/generate-seo-files.js:
       these pages are prerendered into the image like everything else, and the edge is what
       gates them. Nothing here should be indexable if a crawler ever reaches it. -->
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<!-- data-pagefind-ignore keeps drafts out of the site search index. Auth on the route cannot
     do this job: the index under build/pagefind/ is a public asset, so an indexed draft is
     readable from the public search box without ever loading this page. -->
<div data-pagefind-ignore>
  {@render children()}
</div>
