import { Carta } from 'carta-md';
import DOMPurify from 'isomorphic-dompurify';

// Create a reusable Carta instance
export const carta = new Carta({
  sanitizer: DOMPurify.sanitize
});
