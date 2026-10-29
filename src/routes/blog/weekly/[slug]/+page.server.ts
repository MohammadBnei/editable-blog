import { error } from '@sveltejs/kit';
import { getAllContent, getContentByUrl } from '$lib/cms/content-processor';
import type { EntryGenerator, PageServerLoad } from './$types';

export const entries: EntryGenerator = async () => {
  const posts = await getAllContent();
  return posts.filter(item => item.directory === 'blog/weekly').map(post => ({ slug: post.slug }));
};

export const load: PageServerLoad = async ({ params }) => {
  const post = await getContentByUrl(`/blog/weekly/${params.slug}`);

  if (!post) {
    error(404, 'Rundown not found');
  }

  return { post };
};
