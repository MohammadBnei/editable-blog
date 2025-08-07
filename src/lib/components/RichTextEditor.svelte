<script>
  import { MarkdownEditor } from 'carta-md';
  import { carta } from '$lib/carta.js';
  import 'carta-md/default.css';

  export let content = '';
  export let multiLine = false;
</script>

<MarkdownEditor {carta} bind:value={content} />

<style>
  :global(.carta-font-code) {
    font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
    font-size: 1.1rem;
    line-height: 1.1rem;
    letter-spacing: normal;
  }
</style>
