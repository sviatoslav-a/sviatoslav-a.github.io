// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: process.env.SITE_URL || 'https://sviatoslav-a.github.io',
  trailingSlash: 'ignore',
  build: { inlineStylesheets: 'always' },
});
