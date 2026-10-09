// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: process.env.SITE_URL || 'https://zotho-portfolio.vercel.app',
  trailingSlash: 'ignore',
  build: { inlineStylesheets: 'always' },
});
