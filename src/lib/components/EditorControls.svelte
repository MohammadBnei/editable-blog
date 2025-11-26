<script>
  import { activeEditorView } from '$lib/stores';
  import { onDestroy } from 'svelte';
  import ToggleMark from './tools/ToggleMark.svelte';
  import ToggleBulletList from './tools/tools/ToggleBulletList.svelte';
  import ToggleBlockquote from './tools/ToggleBlockquote.svelte';
  import ToggleOrderedList from './tools/ToggleOrderedList.svelte';
  import PrimaryButton from './PrimaryButton.svelte';
  import SecondaryButton from './SecondaryButton.svelte';
  import ToggleHeading from './tools/ToggleHeading.svelte';
  import InsertImage from './tools/InsertImage.svelte';
  import CreateLink from './tools/CreateLink.svelte';
  import { uploadAsset } from '$lib/uploadAsset.js';
  import { nanoid } from '$lib/util.js';
  import { is_safari } from '$lib/util.js';

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

  // Upload function for handling file uploads
  async function upload(file) {
    try {
      let extension;
      if (file.type === 'application/pdf') {
        extension = 'pdf';
      } else {
        // We convert all image uploads to the WEBP image format
        extension = is_safari() ? 'jpg' : 'webp';
      }
      const path = [
        [extension === 'pdf' ? 'files' : 'images', nanoid()].join('/'),
        extension
      ].join('.');

      // Upload the file using your existing uploadAsset function
      await uploadAsset(file, path, p => {
        // Progress callback
        console.log(`Upload progress: ${p}%`);
      });

      // Return the URL to the uploaded asset
      return `/assets/${path}`;
    } catch (err) {
      console.error('Error uploading file:', err);
      return null;
    }
  }

  // Support common image formats and PDF
  const supportedMimeTypes = [
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'application/pdf'
  ];
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
