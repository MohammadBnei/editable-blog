<script>
  import { isEditing } from '$lib/stores.js';

  let props = $props();

</script>

{#if $isEditing}
  {#await import('$lib/components/tools/EditorControls.svelte') then EditorToolbar}
    <EditorToolbar.default  {...props} />
  {/await}
{/if}
