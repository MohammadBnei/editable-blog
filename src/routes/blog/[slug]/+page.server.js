import { getContentByUrl, getAllContent } from '$lib/cms/content-processor.js';
import { error } from '@sveltejs/kit';

export const entries = async () => {
  const posts = await getAllContent();
  // `directory`, not `mainDirectory`: the latter is 'blog' for everything
  // under content/blog/**, so subdirectories (blog/fr, blog/weekly) would be
  // prerendered here at /blog/<slug> too — a 404 that fails the build for any
  // slug without an English twin. Each subdirectory has its own route.
  return posts.filter(item => item.directory === 'blog').map(post => ({ slug: post.slug }));
};

export const load = async ({ params }) => {
  const url = `/blog/${params.slug}`;
  const post = await getContentByUrl(url);

  if (!post) {
    throw error(404, 'Post not found');
  }

  const frUrl = `/blog/fr/${params.slug}`;
  const frPost = await getContentByUrl(frUrl);

  return {
    post,
    translationUrl: frPost ? frUrl : null
  };
};
