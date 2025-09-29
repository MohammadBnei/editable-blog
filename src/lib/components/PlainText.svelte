<script>
  import { isEditing } from '$lib/stores.js';
  import PlainTextEditor from './PlainTextEditor.svelte';

  export let content;
  export let multiLine = false;
</script>

{#if $isEditing}
  <PlainTextEditor {multiLine} bind:content />
{:else}
  <div class="whitespace-pre-wrap">
    {content}
  </div>
{/if}
