<script>
  import { onMount, onDestroy } from 'svelte';

  export let content = '';
  export let multiLine = false;

  let textareaNode;

  // Focus the textarea when the component mounts
  onMount(() => {
    if (textareaNode) {
      textareaNode.focus();
    }
  });

  // No onDestroy needed as there are no external resources to clean up
</script>

<textarea
  bind:this={textareaNode}
  bind:value={content}
  class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
  class:h-8={!multiLine}
  class:min-h-[100px]={multiLine}
  class:resize-y={multiLine}
  class:overflow-hidden={!multiLine}
  rows={multiLine ? 5 : 1}
  on:keydown={(e) => {
    // Prevent new lines if not multiLine, but allow other key presses
    if (!multiLine && e.key === 'Enter') {
      e.preventDefault();
      // Optionally, you could dispatch a custom event here for form submission
      // textareaNode.dispatchEvent(new CustomEvent('submit', { bubbles: true }));
    }
  }}
></textarea>

<style>
  /* Basic styling for the textarea */
  textarea {
    font-family: inherit; /* Inherit font from parent */
  }
  /* Hide scrollbar for single line, but allow content to scroll horizontally */
  .overflow-hidden {
    overflow-x: auto;
    overflow-y: hidden;
    white-space: nowrap; /* Keep content on a single line */
  }
</style>
