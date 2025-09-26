<script>
  import { activeEditorView } from '$lib/stores.js';
  import { onDestroy } from 'svelte';
  import PrimaryButton from '../PrimaryButton.svelte';
  import SecondaryButton from '../SecondaryButton.svelte';

  let editorView = $state();
  let editorState = $state();

  const unsubscribe = activeEditorView.subscribe(value => {
    editorView = value;
    editorState = value?.state;
  });

  let { save, cancel } = $props();

  onDestroy(unsubscribe);

  function onKeyDown(e) {
    // Trigger save
    if (e.key === 's' && e.metaKey) {
      save?.();
      e.preventDefault();
      e.stopPropagation();
    }
  }
</script>

<div class="sticky top-0 z-10 sm:py-4 sm:px-4">
  <div
    class="max-w-(--breakpoint-lg) mx-auto px-2 backdrop-blur-xs bg-white bg-opacity-95 border-b border-t sm:border sm:rounded-full border-gray-100 shadow-sm"
  >
    <div>
      <div class="flex items-center justify-center py-3 px-1">
        <div class="flex-1 h-8"></div>
        <SecondaryButton type="button" on:click={cancel}>Cancel</SecondaryButton>
        <div class="w-2 sm:w-4"></div>
        <PrimaryButton type="button" on:click={save}>Save</PrimaryButton>
      </div>
    </div>
  </div>
</div>

<svelte:window onkeydown={onKeyDown} />
