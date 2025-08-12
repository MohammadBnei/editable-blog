<script>
  import { activeEditorView } from '$lib/stores';
  import { onDestroy } from 'svelte';
  import ToggleMark from './tools/ToggleMark.svelte';
  import ToggleBulletList from './tools/ToggleBulletList.svelte';
  import ToggleBlockquote from './tools/ToggleBlockquote.svelte';
  import ToggleOrderedList from './tools/ToggleOrderedList.svelte';
  import PrimaryButton from './PrimaryButton.svelte';
  import SecondaryButton from './SecondaryButton.svelte';
  import ToggleHeading from './tools/ToggleHeading.svelte';
  import InsertImage from './tools/InsertImage.svelte';
  import CreateLink from './tools/CreateLink.svelte';

  let { currentUser, cancel, save } = $props();

  let editorView = null;
  let editorState = null;

  const unsubscribe = activeEditorView.subscribe(value => {
    editorView = value;
    editorState = value?.state;
  });

  function handleCancel() {
    cancel?.();
  }

  function handleSave() {
    save?.();
  }

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
      <div class="flex items-center overflow-x-auto py-3 px-1">
        <div class="flex-1 h-8" />
        <SecondaryButton type="button" on:click={handleCancel}>Cancel</SecondaryButton>
        <div class="shrink-0 w-2 sm:w-4" />
        <PrimaryButton type="button" on:click={handleSave}>Save</PrimaryButton>
      </div>
    </div>
  </div>
</div>

<svelte:window onkeydown={onKeyDown} />
