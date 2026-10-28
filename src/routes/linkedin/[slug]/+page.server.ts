import { getContentByUrl, getAllContent } from '$lib/cms/content-processor';
import { error } from '@sveltejs/kit';
import type { EntryGenerator, PageServerLoad } from './$types';

export const entries: EntryGenerator = async () => {
  const posts = await getAllContent();
  return posts.filter(item => item.directory === 'linkedin').map(post => ({ slug: post.slug }));
};

export const load: PageServerLoad = async ({ params }) => {
  const post = await getContentByUrl(`/linkedin/${params.slug}`);

  if (!post) {
    error(404, 'LinkedIn draft not found');
  }

  return { post };
};
