import { getContentByUrl, getAllContent } from '$lib/cms/content-processor.js';
import { error } from '@sveltejs/kit';

export const entries = async () => {
  const posts = await getAllContent();
  return posts.filter(item => item.directory === 'linkedin').map(post => ({ slug: post.slug }));
};

export const load = async ({ params }) => {
  const post = await getContentByUrl(`/linkedin/${params.slug}`);

  if (!post) {
    error(404, 'LinkedIn draft not found');
  }

  return { post };
};
