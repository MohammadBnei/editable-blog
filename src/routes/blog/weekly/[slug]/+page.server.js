import { getContentByUrl, getAllContent } from '$lib/cms/content-processor.js';
import { error } from '@sveltejs/kit';

export const entries = async () => {
  const posts = await getAllContent();
  return posts.filter(item => item.directory === 'blog/weekly').map(post => ({ slug: post.slug }));
};

export const load = async ({ params }) => {
  const post = await getContentByUrl(`/blog/weekly/${params.slug}`);

  if (!post) {
    error(404, 'Rundown not found');
  }

  return { post };
};
