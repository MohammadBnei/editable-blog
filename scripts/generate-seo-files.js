#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateSEOFiles() {
  try {
    // Load site config from JSON
    const configPath = path.join(__dirname, '..', 'site.config.json');
    if (!fs.existsSync(configPath))
      return console.log('⚠️ site.config.json not found. Skipping SEO generation.');

    const siteConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

    // Get the site URL from config
    const siteUrl = siteConfig.site.url;

    console.log('🚀 Generating SEO files...');
    console.log(`🔗 Using site URL: ${siteUrl}`);

    // Generate sitemap using svelte-sitemap.
    //
    // `/linkedin` is gated at the edge, but the pages are prerendered into the image like
    // every other route — so a sitemap entry would publish the URL of every draft to anyone
    // who fetches sitemap.xml. Excluded here and disallowed in robots.txt below; the RSS
    // exclusion lives in site.config.json and the search-index one is `data-pagefind-ignore`
    // in src/routes/linkedin/+layout.svelte. Four places, because each covers a different
    // way out of the build and none of them covers another.
    // TWO ignore flags, not one, and this is not redundancy. `*` does not cross a slash:
    // `-i "/linkedin*"` alone drops the index and leaves every draft page in the sitemap,
    // which was verified by running it and finding
    // https://blog.bnei.dev/linkedin/<slug> still listed. A comma-separated list is not
    // supported either — it silently excludes nothing. Repeated flags is the form that works.
    console.log('📄 Generating sitemap...');
    execSync(`npx svelte-sitemap --domain ${siteUrl} -i "/linkedin*" -i "/linkedin/*"`, {
      stdio: 'inherit'
    });

    // Create robots.txt content
    const robotsContent = `User-agent: *
Allow: /
Disallow: /linkedin

Sitemap: ${siteUrl}/sitemap.xml
`;

    // Write robots.txt to build directory
    const buildDir = path.join(__dirname, '..', 'build');
    const robotsPath = path.join(buildDir, 'robots.txt');

    // Ensure build directory exists
    if (!fs.existsSync(buildDir)) {
      console.error('❌ Build directory does not exist. Please run "npm run build" first.');
      process.exit(1);
    }

    // Write the robots.txt file
    fs.writeFileSync(robotsPath, robotsContent);

    console.log('✅ All SEO files generated successfully!');
    console.log(`📍 Sitemap: ${buildDir}/sitemap.xml`);
    console.log(`📍 Robots: ${robotsPath}`);
    console.log(`🌐 Sitemap URL: ${siteUrl}/sitemap.xml`);
  } catch (error) {
    console.error('❌ Error generating SEO files:', error.message);
    process.exit(1);
  }
}

generateSEOFiles();
