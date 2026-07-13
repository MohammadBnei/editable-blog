import { getContentByUrl, getAllContent } from 'statue-ssg/cms/content-processor.js';
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

  return {
    post
  };
};
