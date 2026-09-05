import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  HUB_ORIGIN,
  renderContact,
  renderHome,
  renderMixRack,
  renderNotFound,
  renderProducts,
  STYLESHEET_FILE,
} from '../src/site.mjs';
import { validateSource } from './validate.mjs';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputRoot = resolve(projectRoot, 'dist');

validateSource();
await rm(outputRoot, { recursive: true, force: true });

/* One manifest, three consumers: the files written, the sitemap, and the
   canonical each page declares. Deriving the sitemap from the same list the
   build writes is what stops it drifting into advertising URLs that do not
   exist -- which is exactly what the Tempo Delay sitemap had done.
   404.html carries `indexable: false`: it is a real output but never a search
   result, so it is written and never listed. */
const routes = [
  { file: 'index.html', url: '/', render: renderHome, indexable: true },
  { file: 'products/index.html', url: '/products/', render: renderProducts, indexable: true },
  { file: 'products/mixrack/index.html', url: '/products/mixrack/', render: renderMixRack, indexable: true },
  { file: 'contact/index.html', url: '/contact/', render: renderContact, indexable: true },
  { file: '404.html', url: null, render: renderNotFound, indexable: false }
];

const outputs = new Map(routes.map((route) => [route.file, route.render()]));

for (const [relativePath, content] of outputs) {
  const destination = resolve(outputRoot, relativePath);
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, content, 'utf8');
}

await mkdir(resolve(outputRoot, 'assets'), { recursive: true });
// Written under the fingerprinted name the pages ask for, so the markup and
// the stylesheet it depends on are deployed as one unit.
await cp(resolve(projectRoot, 'src/styles.css'), resolve(outputRoot, 'assets', STYLESHEET_FILE));
await cp(resolve(projectRoot, 'src/fonts'), resolve(outputRoot, 'assets/fonts'), { recursive: true });
await cp(resolve(projectRoot, 'src/favicon.svg'), resolve(outputRoot, 'assets/favicon.svg'));
// 1200x630 share cards. Generated from the design system rather than drawn by
// hand; see src/og/README.md for how to regenerate them.
await cp(resolve(projectRoot, 'src/og'), resolve(outputRoot, 'assets/og'), { recursive: true });
// The Google tag's own two files. They ship from the site origin because the
// CSP has no 'unsafe-inline'; see the comment in src/gtag.js.
await cp(resolve(projectRoot, 'src/gtag.js'), resolve(outputRoot, 'assets/gtag.js'));
await cp(resolve(projectRoot, 'src/consent.js'), resolve(outputRoot, 'assets/consent.js'));
// The support form's own script. It is served from the site origin because
// the CSP has no 'unsafe-inline'; see the comment in src/contact.js.
await cp(resolve(projectRoot, 'src/contact.js'), resolve(outputRoot, 'assets/contact.js'));
// The MixRack release-notice form. Same origin, same reason, and the same
// fetch-not-POST shape that `form-action 'none'` forces.
await cp(resolve(projectRoot, 'src/notify.js'), resolve(outputRoot, 'assets/notify.js'));
// The A/B listener and the renders it plays. Same-origin for the same reason,
// and because `media-src` inherits the `default-src 'self'` in vercel.json.
await cp(resolve(projectRoot, 'src/ab.js'), resolve(outputRoot, 'assets/ab.js'));
// Conversion measurement. One delegated listener, same file on all four
// StudioZIO properties, same-origin for the same CSP reason as the rest.
await cp(resolve(projectRoot, 'src/events.js'), resolve(outputRoot, 'assets/events.js'));
await cp(resolve(projectRoot, 'src/media'), resolve(outputRoot, 'assets/media'), { recursive: true });
const indexableUrls = routes.filter((route) => route.indexable).map((route) => `${HUB_ORIGIN}${route.url}`);

await writeFile(
  resolve(outputRoot, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n`
    + `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`
    + indexableUrls.map((url) => `  <url>\n    <loc>${url}</loc>\n  </url>\n`).join('')
    + `</urlset>\n`,
  'utf8'
);

// robots.txt exists to point crawlers at the sitemap; it had never named one.
await writeFile(
  resolve(outputRoot, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${HUB_ORIGIN}/sitemap.xml\n`,
  'utf8'
);

console.log(`Built ${outputs.size} HTML pages and a ${indexableUrls.length}-URL sitemap into dist/`);
