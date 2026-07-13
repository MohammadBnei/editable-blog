import { getContentByUrl, getAllContent } from '$lib/cms/content-processor.js';
import { error } from '@sveltejs/kit';

export const entries = async () => {
  const posts = await getAllContent();
  return posts.filter(item => item.directory === 'blog/fr').map(post => ({ slug: post.slug }));
};

export const load = async ({ params }) => {
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
