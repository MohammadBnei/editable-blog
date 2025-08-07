<script>
  import { isEditing } from '$lib/stores.js';
  import { Markdown, MarkdownEditor } from 'carta-md';
  import { carta } from '$lib/carta.js';
  import 'carta-md/default.css';

  export let content;
  export let multiLine = false;
</script>

{#if $isEditing}
  <MarkdownEditor {carta} bind:value={content} />
{:else}
  {#key content}
    <Markdown {carta} value={content} />
  {/key}
{/if}

<style>
  :global(.carta-font-code) {
    font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
    font-size: 1.1rem;
    line-height: 1.1rem;
    letter-spacing: normal;
  }
</style>
