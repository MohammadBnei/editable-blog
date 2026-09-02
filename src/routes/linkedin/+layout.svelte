<script>
  let { children } = $props();
</script>

<svelte:head>
  <!-- Belt and braces with the sitemap/robots exclusions in scripts/generate-seo-files.js:
       these pages are prerendered into the image like everything else, and the edge is what
       gates them. Nothing here should be indexable if a crawler ever reaches it. -->
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<!-- data-pagefind-ignore strips this content from the search index, but it does NOT stop
     the page being indexed: Pagefind still records the URL and falls back to <title>, and
     build/pagefind/ is a plain public asset the Traefik gate does not cover. Verified by
     running it — the draft URL and "LinkedIn drafts" were both in the index.
     What actually excludes these pages is the conditional data-pagefind-body in the ROOT
     layout, which flips Pagefind to an allowlist. This attribute stays as a second layer. -->
<div data-pagefind-ignore>
  {@render children()}
</div>
