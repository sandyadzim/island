import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { SITE } from './src/config/site.ts';

export default defineConfig({
  site: SITE.url,
  trailingSlash: 'always',
  output: 'static',
  integrations: [sitemap()],
  devToolbar: { enabled: false },
  vite: { plugins: [tailwindcss()] },
});
