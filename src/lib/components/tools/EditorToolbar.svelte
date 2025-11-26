<script>
  import { isEditing } from '$lib/stores.js';

  let { cancel: handleCancel, save } = $props();

  function cancel() {
    $isEditing = false;
    handleCancel?.();
  }
</script>

{#if $isEditing}
  {#await import('$lib/components/EditorControls.svelte') then EditorToolbar}
    <EditorToolbar.default {cancel} {save} />
  {/await}
{/if}
