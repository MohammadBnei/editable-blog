<script lang="ts">
  import { isEditing } from '$lib/stores';
  import { Markdown, MarkdownEditor, Carta } from 'carta-md';
  import { code } from '@cartamd/plugin-code';
  import { attachment } from '@cartamd/plugin-attachment';
  import uploadAsset from '$lib/uploadAsset';
  import { nanoid, is_safari } from '$lib/util';
  import 'carta-md/default.css';
  import '@cartamd/plugin-code/default.css';
  import '@cartamd/plugin-attachment/default.css';

  const carta = new Carta({
    sanitizer: false,
    extensions: [
      code(),
      attachment({
        upload: async (file) => {
          try {
            // We convert all uploads to the WEBP image format
            const extension = is_safari() ? 'jpg' : 'webp';
            const path = [['images', nanoid()].join('/'), extension].join('.');
            
            // Upload the file using your existing uploadAsset function
            await uploadAsset(file, path, (p) => {
              // Progress callback
              console.log(`Upload progress: ${p}%`);
            });
            
            // Return the URL to the uploaded asset
            return `/assets/${path}`;
          } catch (err) {
            console.error('Error uploading file:', err);
            return null;
          }
        },
        // Support common image formats
        supportedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml']
      })
    ]
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
