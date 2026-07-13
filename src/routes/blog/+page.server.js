import { getAllContent } from 'statue-ssg/cms/content-processor.js';

export const load = async () => {
  // Get all content and filter for English blog posts (French posts live under blog/fr)
  const allContent = await getAllContent();
  const posts = allContent.filter(item => item.directory === 'blog');

  return {
    posts
  };
};
