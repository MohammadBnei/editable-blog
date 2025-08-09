<script lang="ts">
  import { Carta, MarkdownEditor } from 'carta-md';
  import 'carta-md/default.css';

  const carta = new Carta({
    sanitizer: false
  });

  let { content = $bindable<string>() } = $props();
</script>

<MarkdownEditor {carta} bind:value={content} />

<style>
  :global(.carta-font-code) {
    font-family: '...', monospace;
    font-size: 1.1rem;
    line-height: 1.1rem;
    letter-spacing: normal;
  }
</style>