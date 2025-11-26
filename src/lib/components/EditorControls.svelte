<script>
  import { activeEditorView } from '$lib/stores';
  import { onDestroy } from 'svelte';
  import PrimaryButton from './PrimaryButton.svelte';
  import SecondaryButton from './SecondaryButton.svelte';
  import uploadAsset from '$lib/uploadAsset';
  import { nanoid, is_safari } from '$lib/util';

  let { cancel, save } = $props();

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

  // Hidden file input
  let fileInput;

  // Handle file selection
  function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
      uploadFile(file);
    }
  }

  // Trigger file input click
  function triggerFileInput() {
    fileInput?.click();
  }

  // Upload function for handling file uploads
  async function uploadFile(file) {
    try {
      let extension;
      if (file.type === 'application/pdf') {
        extension = 'pdf';
      } else {
        // We convert all image uploads to the WEBP image format
        extension = is_safari() ? 'jpg' : 'webp';
      }
      const path = [[extension === 'pdf' ? 'files' : 'images', nanoid()].join('/'), extension].join(
        '.'
      );

      // Upload the file using your existing uploadAsset function
      await uploadAsset(file, path, p => {
        // Progress callback
        console.log(`Upload progress: ${p}%`);
      });

      // Return the URL to the uploaded asset
      const assetUrl = `/assets/${path}`;
      
      // Store the URL and show modal
      uploadedUrl = assetUrl;
      uploadModal.showModal();
      
      return assetUrl;
    } catch (err) {
      console.error('Error uploading file:', err);
      return null;
    }
  }

  // Copy URL to clipboard
  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      copied = true;
      setTimeout(() => {
        copied = false;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
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

  // Modal state
  let uploadModal;
  let uploadedUrl = '';
  let copied = false;
</script>

<div class="sticky top-0 z-10 sm:py-4 sm:px-4">
  <div
    class="max-w-(--breakpoint-lg) mx-auto px-2 backdrop-blur-xs bg-white bg-opacity-95 border-b border-t sm:border sm:rounded-full border-gray-100 shadow-sm"
  >
    <div>
      <div class="flex items-center overflow-x-auto py-3 px-1">
        <!-- Upload Button -->
        <SecondaryButton type="button" on:click={triggerFileInput} title="Upload file">
          <div class="flex items-center gap-1">
            <svg
              class="w-4 h-4 mr-1.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            Upload
          </div>
        </SecondaryButton>

        <div class="flex-1 h-8" />

        <SecondaryButton type="button" on:click={handleCancel}>Cancel</SecondaryButton>
        <div class="shrink-0 w-2 sm:w-4" />
        <PrimaryButton type="button" on:click={handleSave}>Save</PrimaryButton>
      </div>
    </div>
  </div>
</div>

<!-- Hidden file input -->
<input
  bind:this={fileInput}
  type="file"
  accept={supportedMimeTypes.join(',')}
  on:change={handleFileSelect}
  class="hidden"
/>

<!-- Upload Success Modal -->
<dialog bind:this={uploadModal} class="modal">
  <div class="modal-box">
    <h3 class="font-bold text-lg mb-4">File uploaded successfully!</h3>
    <div class="py-4">
      <p class="text-sm text-base-content/70 mb-2">Asset URL:</p>
      <div class="flex items-center gap-2">
        <code class="flex-1 px-3 py-2 bg-base-200 rounded text-sm break-all">
          {uploadedUrl}
        </code>
        <button
          class="btn btn-sm btn-primary"
          on:click={() => copyToClipboard(uploadedUrl)}
        >
          {#if copied}
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          {:else}
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          {/if}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
    <div class="modal-action">
      <form method="dialog">
        <button class="btn btn-primary">Close</button>
      </form>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>

<svelte:window on:keydown={onKeyDown} />
