#!/usr/bin/env bun
import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runPagefind() {
  try {
    const configPath = join(__dirname, '../site.config.json');
    let siteConfig = {};
    if (existsSync(configPath)) {
      siteConfig = JSON.parse(readFileSync(configPath, 'utf-8'));
    }

    // Only index if search is enabled
    const searchEnabled = siteConfig?.search?.enabled ?? false;

    if (searchEnabled) {
      console.log('Search is enabled. Running pagefind indexing...');
      execSync('bunx pagefind --site build', { stdio: 'inherit' });
      console.log('Pagefind indexing completed.');
    } else {
      console.log('Search is disabled. Skipping pagefind indexing.');
    }
  } catch (error) {
    console.error('Error running pagefind:', error.message);
    process.exit(1);
  }
}

runPagefind();
