import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  if (!site)
    throw new Error('Set the production site URL in astro.config.mjs.');

  return new Response(
    `User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap-index.xml', site).href}\n`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
};
