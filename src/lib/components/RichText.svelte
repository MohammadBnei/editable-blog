<script lang="ts">
  import { isEditing } from '$lib/stores';
  import { Streamdown } from 'streamdown';

  let { content = $bindable<string>() } = $props();
  let textareaElement: HTMLTextAreaElement;
</script>

{#if $isEditing}
  <div class="w-full">
    <textarea
      bind:this={textareaElement}
      bind:value={content}
      class="w-full h-64 p-4 border border-gray-300 rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
      placeholder="Write your markdown here..."
    />
  </div>
{:else}
  <div class="prose md:prose-xl w-full max-w-full">
    {#key content}
      <Streamdown content={content} />
    {/key}
  </div>
{/if}

<style>
  :global(.streamdown) {
    font-family: inherit;
  }
  
  :global(.streamdown h1),
  :global(.streamdown h2),
  :global(.streamdown h3),
  :global(.streamdown h4),
  :global(.streamdown h5),
  :global(.streamdown h6) {
    margin-top: 1.5em;
    margin-bottom: 0.5em;
    font-weight: 600;
  }
  
  :global(.streamdown p) {
    margin-bottom: 1em;
  }
  
  :global(.streamdown code) {
    background-color: #f3f4f6;
    padding: 0.2em 0.4em;
    border-radius: 0.25rem;
    font-size: 0.875em;
  }
  
  :global(.streamdown pre) {
    background-color: #f3f4f6;
    padding: 1em;
    border-radius: 0.5rem;
    overflow-x: auto;
  }
  
  :global(.streamdown pre code) {
    background-color: transparent;
    padding: 0;
  }
</style>
