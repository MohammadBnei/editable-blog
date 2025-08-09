<script lang="ts">
	import { carta } from '$lib/carta';
  import { isEditing } from '$lib/stores';
  import { Markdown, MarkdownEditor } from 'carta-md';

  import 'carta-md/default.css';
  import '@cartamd/plugin-code/default.css';
  import '@cartamd/plugin-attachment/default.css';

  

  let { content = $bindable<string>() } = $props();
</script>

{#if $isEditing}
  <div class="not-prose">
    <MarkdownEditor {carta} bind:value={content}  />
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

  :global(.carta-editor > textarea) {
		height: 100% !important; /* Use !important cautiously */
		min-height: 100%;
		/* Add box-sizing if needed */
		box-sizing: border-box;
	}
</style>
