import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://loyaledge.net',
  // Preserve spaces between inline elements like the original static HTML.
  compressHTML: true,
  // Pages are built as privacy/index.html: the S3/CloudFront setup serves /privacy from
  // "privacy/index.html" (same as fgfc-markets). "file" (privacy.html) gives a 404 there.
  build: {
    format: 'directory',
  },
  // Images uploaded in WordPress are downloaded and converted to WebP at build time.
  image: {
    domains: ['wordpress.plexop.dev'],
  },
});
