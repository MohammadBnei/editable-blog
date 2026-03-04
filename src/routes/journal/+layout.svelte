<script lang="ts">
  import WebsiteHeader from '$lib/components/WebsiteHeader.svelte';
  let { children } = $props();

  let showUserMenu = $state(false);
</script>

<WebsiteHeader bind:showUserMenu />

<main>
  {@render children()}
</main>
