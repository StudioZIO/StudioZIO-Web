/* Refreshes the snapshot of the other three StudioZIO sites for the hub's
   search page.

   The hub indexes its own pages during every build, straight from the HTML it
   just rendered, so hub results can never be stale. The other three sites are
   separate repositories with their own deploys, and the hub's build must not
   depend on them being up, so their content is fetched here, by hand, and
   committed as src/search-external.json. Run it after publishing a change on
   one of those sites:

       npm run search:refresh

   Each entry records the URL it came from and the day it was taken, so a
   stale snapshot is visible in the diff rather than invisible in production. */

import { writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/* The three sites, in the order the header lists them. Each is read from its
   own sitemap: the sitemap is the site's own statement of which pages exist,
   so nothing here has to guess a path or hard-code one that may be renamed. */
const SITES = [
  { key: 'mastering', label: 'Mastering Suite', origin: 'https://studioziomasteringsuite.vercel.app' },
  { key: 'tempo', label: 'Tempo Delay', origin: 'https://www.tempodelay.tech' },
  { key: 'mixrack', label: 'MixRack', origin: 'https://studioziomixrack.vercel.app' }
];

async function get(url) {
  const response = await fetch(url, { redirect: 'follow' });
  if (!response.ok) throw new Error(`${url} answered ${response.status}`);
  return response.text();
}

function sitemapUrls(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim());
}

const urls = [];
for (const site of SITES) {
  const xml = await get(`${site.origin}/sitemap.xml`);
  const found = sitemapUrls(xml);
  if (found.length === 0) throw new Error(`${site.origin} lists no pages in its sitemap`);
  for (const url of found) {
    if (!url.startsWith(site.origin)) {
      throw new Error(`${site.origin} lists a foreign URL in its sitemap: ${url}`);
    }
    urls.push({ site, url });
  }
}

const { extract } = await import('./search_text.mjs');

const pages = [];
for (const { site, url } of urls) {
  const html = await get(url);
  const page = extract(html, url);
  pages.push({ site: site.key, siteLabel: site.label, ...page });
  console.log(`indexed ${url} (${page.text.length} characters)`);
}

const snapshot = {
  takenOn: new Date().toISOString().slice(0, 10),
  sites: SITES.map(({ key, label, origin }) => ({ key, label, origin })),
  pages
};

await writeFile(
  resolve(projectRoot, 'src/search-external.json'),
  `${JSON.stringify(snapshot, null, 2)}\n`,
  'utf8'
);

console.log(`\nwrote src/search-external.json — ${pages.length} pages from ${SITES.length} sites`);
