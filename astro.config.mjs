import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://loyaledge.net',
  // Preserve spaces between inline elements like the original static HTML.
  compressHTML: true,
  build: {
    format: 'file',
  },
});
