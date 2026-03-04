<script lang="ts">
  import WebsiteHeader from '$lib/components/WebsiteHeader.svelte';
  let { children } = $props();
</script>

<WebsiteHeader />

<main>
  {@render children()}
</main>
