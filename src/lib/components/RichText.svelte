<script lang="ts">
  import { isEditing } from '$lib/stores';
  import { Markdown, MarkdownEditor, Carta } from 'carta-md';
  import 'carta-md/default.css';

  const carta = new Carta({
    sanitizer: false
  });

  let { content = $bindable<string>() } = $props();
</script>

{#if $isEditing}
  <div class="not-prose">
    <MarkdownEditor {carta} bind:value={content} />
  </div>
{:else}
  {#key content}
    <Markdown {carta} value={content} />
  {/key}
{/if}

<style>
  :global(.carta-font-code) {
    font-family: '...', monospace;
    font-size: 1.1rem;
    line-height: 1.1rem;
    letter-spacing: normal;
    padding: 1rem;
  }
</style>
