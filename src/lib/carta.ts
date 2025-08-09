import { Carta } from 'carta-md';
import DOMPurify from 'isomorphic-dompurify';
import { code } from '@cartamd/plugin-code';
import { attachment } from '@cartamd/plugin-attachment';
import uploadAsset from '$lib/uploadAsset';
import { nanoid, is_safari } from '$lib/util';

// Create a reusable Carta instance
export const carta = new Carta({
  sanitizer: DOMPurify.sanitize,
  extensions: [
    code(),
    attachment({
      upload: async file => {
        try {
          // We convert all uploads to the WEBP image format
          const extension = is_safari() ? 'jpg' : 'webp';
          const path = [['images', nanoid()].join('/'), extension].join('.');

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
      // Support common image formats
      supportedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml']
    })
  ]
});