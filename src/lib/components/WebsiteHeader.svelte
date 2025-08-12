<script>
  import WebsiteNav from '$lib/components/WebsiteNav.svelte';
  import Modal from '$lib/components/Modal.svelte';
  import EditorToolbar from '$lib/components/tools/EditorToolbar.svelte';

  let { showUserMenu = $bindable(), cancel, save, children } = $props();
</script>

<EditorToolbar {cancel} {save} />
<WebsiteNav bind:showUserMenu />
{#if showUserMenu}
  <Modal close={() => (showUserMenu = false)}>
    {@render children()}
  </Modal>
{/if}
