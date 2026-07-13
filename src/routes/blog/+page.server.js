import { getAllContent } from '$lib/cms/content-processor.js';

export const load = async () => {
  const allContent = await getAllContent();
  const posts = allContent.filter(item => item.directory === 'blog');
  const frPosts = allContent.filter(item => item.directory === 'blog/fr');

  return {
    posts,
    frPosts
  };
};
