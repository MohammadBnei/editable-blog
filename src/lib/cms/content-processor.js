// Node.js specific modules should only run on the server side
// This file uses mdsvex for markdown processing instead of marked

// Node.js modules
import fs from 'fs';
import path from 'path';
import { compile } from 'mdsvex';
import matter from 'gray-matter';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';

// This error check is to provide an early warning when this module is attempted to be used in the browser
const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
if (isBrowser) {
  console.error('content-processor-mdsvex.js should only be used on the server side!');
  throw new Error('Content processor cannot run on the client side!');
}

// Try to load site config, but don't fail if not available
let siteConfig = {};
try {
  const configPath = path.resolve('site.config.json');
  if (fs.existsSync(configPath)) {
    siteConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  }
} catch {
  // siteConfig not available, will use empty object
}

// Configure mdsvex options
const mdsvexOptions = {
  extensions: ['.md'],
  remarkPlugins: [remarkGfm],
  rehypePlugins: [rehypeSlug],
  layout: null // We'll handle layout in Svelte components
};

/**
 * Process markdown with mdsvex and extract HTML content
 * Since mdsvex produces Svelte component code, we need to extract just the HTML part
 */
const processMarkdownWithMDSvex = async markdown => {
  try {
    const { code } = await compile(markdown, mdsvexOptions);

    // Extract HTML from mdsvex output
    let html = code;

    // Remove script tags and their content
    html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

    // Remove Svelte {@html `...`} wrappers and keep just the inner HTML
    // mdsvex wraps code blocks in {@html `...`} which we need to unwrap
    html = html.replace(/\{@html\s+`([^`]*(?:`[^`]*`)*)`\}/g, '$1');

    // Remove remaining Svelte-specific wrappers
    html = html.replace(/\{[\s\S]*?\}/g, match => {
      // Keep if it's not a Svelte directive (like {@html} already handled)
      if (match.startsWith('{@') || match.includes('=>')) {
        return '';
      }
      return match;
    });

    html = html.trim();

    return html;
  } catch (error) {
    console.error('MDSvex processing error:', error);
    return `<p>Error processing markdown: ${error.message}</p>`;
  }
};

// Function to remove the first h1 heading from HTML content
const removeFirstH1 = html => {
  return html.replace(/<h1[^>]*>(.*?)<\/h1>/, '');
};

/**
 * Creates a custom marked-like renderer for link transformation
 * We'll handle this with post-processing since mdsvex uses rehype/remark
 */
const transformLinks = (html, currentDirectory) => {
  // Transform internal .md links
  return html.replace(/href="([^"]+)"/g, (match, href) => {
    // Skip external links and anchors
    if (href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:')) {
      return match;
    }

    // Remove .md extension
    let transformedHref = href;
    if (transformedHref.endsWith('.md')) {
      transformedHref = transformedHref.slice(0, -3);
    }

    // Handle relative paths
    if (transformedHref.startsWith('./') || transformedHref.startsWith('../')) {
      const resolvedPath = path.join('/', currentDirectory, transformedHref);
      transformedHref = resolvedPath.replace(/\\/g, '/').replace(/\/$/, '');
    } else if (!transformedHref.startsWith('/')) {
      transformedHref = path.join('/', currentDirectory, transformedHref).replace(/\\/g, '/');
    }

    return `href="${transformedHref}"`;
  });
};

// Decode the HTML entities rehype/mdsvex escape inside a compiled code block
const decodeHtmlEntities = str =>
  str
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');

// Mermaid fenced code blocks compile to <pre class="language-mermaid"><code
// class="language-mermaid">...</code></pre>; mermaid.run() instead expects a
// bare <pre class="mermaid"> containing the raw (unescaped) diagram source.
const transformMermaidBlocks = html => {
  return html.replace(
    /<pre class="language-mermaid"><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g,
    (match, code) => `<pre class="mermaid not-prose">${decodeHtmlEntities(code)}</pre>`
  );
};

// Scans all markdown files and folders in the content directory
const scanContentDirectory = async () => {
  const contentPath = path.resolve('content');
  const contentEntries = [];

  if (!fs.existsSync(contentPath)) {
    console.warn('Content folder not found!');
    return contentEntries;
  }

  // Recursively scan the content folder
  async function scanDir(dirPath, relativePath = '') {
    const entries = fs.readdirSync(dirPath);

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry);
      const entryRelativePath = path.join(relativePath, entry);
      const stats = fs.statSync(fullPath);

      if (stats.isDirectory()) {
        // If it's a folder, scan its contents
        await scanDir(fullPath, entryRelativePath);
      } else if (stats.isFile() && (entry.endsWith('.md') || entry.endsWith('.mdx'))) {
        // Add markdown and mdx files to the list
        const isMdx = entry.endsWith('.mdx');
        const slug = entry.replace(/\.mdx?$/, '');
        const url = relativePath ? `/${relativePath}/${slug}`.replace(/\\/g, '/') : `/${slug}`;

        const content = fs.readFileSync(fullPath, 'utf-8');
        const { data, content: markdownContent } = matter(content);

        // Process template variables (both in markdown content and metadata)
        const processedMarkdownContent = processTemplateVariables(markdownContent);
        const processedMetadata = {};

        // Process string values in metadata through template processing
        for (const [key, value] of Object.entries(data)) {
          if (typeof value === 'string') {
            processedMetadata[key] = processTemplateVariables(value);
          } else {
            processedMetadata[key] = value;
          }
        }

        // Add default values and process them through template processing
        const finalMetadata = {
          title: processedMetadata.title || formatTitle(slug),
          description: processedMetadata.description || '',
          date: processedMetadata.date || null,
          author: processedMetadata.author || null,
          ...processedMetadata
        };

        // Fix directory - use full path
        let directory = relativePath.replace(/\\/g, '/');

        // Process content: MDX files are rendered as Svelte components, MD files as HTML
        let html = '';
        if (!isMdx) {
          html = await processMarkdownWithMDSvex(processedMarkdownContent);
          html = removeFirstH1(html);
          html = transformLinks(html, directory);
          html = transformMermaidBlocks(html);
        }

        // Add main directory information to create content tree
        const mainDirectory = directory.split('/')[0] || 'root';

        contentEntries.push({
          slug,
          path: entryRelativePath,
          url,
          directory,
          mainDirectory,
          depth: directory === '' ? 0 : directory.split('/').length,
          content: html,
          metadata: finalMetadata,
          isMdx // Flag for MDX files - rendered client-side as Svelte components
        });
      }
    }
  }

  // Start scanning the content folder
  await scanDir(contentPath);

  return contentEntries;
};

// Function to create a title from a slug
const formatTitle = slug => {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// To scan all content once and cache it
let cachedContent = null;

// Get all content (using cache)
const getAllContent = async () => {
  // Check for development mode to skip caching
  const isDev =
    process.env.NODE_ENV === 'development' ||
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV);

  if (!isDev && cachedContent) return cachedContent;

  // In development, we want to scan every time to pick up changes
  if (isDev) {
    // Clear cache to be safe
    cachedContent = null;
  }

  const content = await scanContentDirectory();

  // Only cache in production
  if (!isDev) {
    cachedContent = content;
  }

  return content;
};

// Get content for a specific URL
const getContentByUrl = async url => {
  const allContent = await getAllContent();

  // Remove trailing slash (/) from URL
  const normalizedUrl = url.endsWith('/') ? url.slice(0, -1) : url;

  // Check content URLs and find matching content
  return allContent.find(entry => {
    // Remove trailing slash from content URL as well
    const entryUrl = entry.url.endsWith('/') ? entry.url.slice(0, -1) : entry.url;
    return entryUrl === normalizedUrl;
  });
};

// Function to process template variables
const processTemplateVariables = content => {
  // Get variables from configuration (with safe defaults)
  const site = siteConfig.site || {};
  const contact = siteConfig.contact || {};
  const social = siteConfig.social || {};
  const legal = siteConfig.legal || {};

  const variables = {
    // Site information
    'site.name': site.name,
    'site.description': site.description,
    'site.url': site.url,
    'site.author': site.author,

    // Contact information
    'contact.email': contact.email,
    'contact.privacyEmail': contact.privacyEmail,
    'contact.supportEmail': contact.supportEmail,
    'contact.phone': contact.phone,
    'contact.address.street': contact.address?.street,
    'contact.address.city': contact.address?.city,
    'contact.address.state': contact.address?.state,
    'contact.address.zipCode': contact.address?.zipCode,
    'contact.address.country': contact.address?.country,
    'contact.address.full': contact.address
      ? `${contact.address.street || ''}, ${contact.address.city || ''}, ${contact.address.state || ''} ${contact.address.zipCode || ''}`.trim()
      : '',

    // Social media
    'social.twitter': social.twitter,
    'social.github': social.github,
    'social.linkedin': social.linkedin,
    'social.facebook': social.facebook,
    'social.instagram': social.instagram,
    'social.youtube': social.youtube,
    'social.discord': social.discord,
    'social.reddit': social.reddit,

    // Legal information
    'legal.privacyPolicyLastUpdated': legal.privacyPolicyLastUpdated,
    'legal.termsLastUpdated': legal.termsLastUpdated,
    'legal.doNotSell.processingTime': legal.doNotSell?.processingTime,

    // Dynamic date functions
    'date.now': new Date().toLocaleDateString('en-US'),
    'date.year': new Date().getFullYear().toString(),
    'date.month': new Date().toLocaleDateString('en-US', { month: 'long' }),
    'date.day': new Date().getDate().toString()
  };

  // Replace template variables
  // Support {{variable.name}} format variables
  let processedContent = content;

  // Process {{variable}} format variables
  processedContent = processedContent.replace(/\{\{([^}]+)\}\}/g, (match, variableName) => {
    const trimmedName = variableName.trim();
    if (Object.hasOwn(variables, trimmedName)) {
      return variables[trimmedName];
    }
    console.warn(`Template variable not found: ${trimmedName}`);
    return match; // Leave unfound variables as they are
  });

  return processedContent;
};

// Export functions
export { getAllContent, getContentByUrl };
