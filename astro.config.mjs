import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://loyaledge.net',
  // Preserve spaces between inline elements like the original static HTML.
  compressHTML: true,
  build: {
    format: 'file',
  },
  // Images uploaded in WordPress are downloaded and converted to WebP at build time.
  image: {
    domains: ['wordpress.plexop.dev'],
  },
});
