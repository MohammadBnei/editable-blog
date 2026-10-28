import { getContentByUrl, getAllContent } from '$lib/cms/content-processor';
import { error } from '@sveltejs/kit';
import type { EntryGenerator, PageServerLoad } from './$types';

export const entries: EntryGenerator = async () => {
  const posts = await getAllContent();
  return posts.filter(item => item.directory === 'blog/fr').map(post => ({ slug: post.slug }));
};

export const load: PageServerLoad = async ({ params }) => {
  const url = `/blog/fr/${params.slug}`;
  const post = await getContentByUrl(url);

  if (!post) {
    error(404, 'Post not found');
  }

  const enUrl = `/blog/${params.slug}`;
  const enPost = await getContentByUrl(enUrl);

  return {
    post,
    translationUrl: enPost ? enUrl : null
  };
};
