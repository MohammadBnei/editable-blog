import { Carta, UnifiedTransformer } from 'carta-md';
import DOMPurify from 'isomorphic-dompurify';
import { code } from '@cartamd/plugin-code';
import { attachment } from '@cartamd/plugin-attachment';
import { component } from '@cartamd/plugin-component';
import { svelte, initializeComponents } from '@cartamd/plugin-component/svelte';
import uploadAsset from '$lib/uploadAsset';
import { nanoid, is_safari } from '$lib/util';
import rehypeMermaid from 'rehype-mermaid';
import mermaid from 'mermaid';
import SecondaryButton from '$lib/components/SecondaryButton.svelte';

mermaid.initialize({ startOnLoad: true });

const transformer: UnifiedTransformer<'async'> = {
  execution: 'async',
  type: 'rehype',
  async transform({ processor }) {
    processor.use(rehypeMermaid, { strategy: 'img-svg' });
  }
};

const mapped = [svelte('a', SecondaryButton) /* other components ... */];

// Create a reusable Carta instance
export const carta = new Carta({
  sanitizer: DOMPurify.sanitize,
  extensions: [
    {
      transformers: [transformer]
    },
    code(),
    component(mapped, initializeComponents),
    attachment({
      upload: async file => {
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
      },
      // Support common image formats and PDF
      supportedMimeTypes: [
        'image/png',
        'image/jpeg',
        'image/gif',
        'image/webp',
        'image/svg+xml',
        'application/pdf'
      ]
    })
  ]
});
