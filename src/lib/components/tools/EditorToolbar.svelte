<script>
  import { isEditing } from '$lib/stores.js';
  import EditorControls from '$lib/components/tools/EditorControls.svelte';
</script>

{#if $isEditing}
  <EditorControls />
{/if}
