import { existsSync, statSync } from 'node:fs';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { notes } from '../src/notes.mjs';
import {
  HUB_ORIGIN,
  renderCommunity,
  renderCommunityQuestions,
  renderCommunityIdeas,
  renderCommunityCompatibility,
  renderCommunityKnownIssues,
  renderCommunityRoadmap,
  renderContact,
  renderHome,
  renderNotFound,
  renderNote,
  renderNotes,
  renderPress,
  renderProducts,
  renderSearch,
  PRESS_KIT_FILE,
  STYLESHEET_FILE,
} from '../src/site.mjs';
import { extract } from './search_text.mjs';
import { validateSource } from './validate.mjs';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/* The feed carries note headings and standfirsts written for people, so an
   ampersand or a quotation mark in one of them would otherwise produce XML no
   reader will parse. */
function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
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
  { file: 'contact/index.html', url: '/contact/', render: renderContact, indexable: true },
  { file: 'notes/index.html', url: '/notes/', render: renderNotes, indexable: true },
  /* Derived from notes.mjs rather than written out here. Adding a note used
     to mean editing this list, the validator's page list and the sitemap
     expectation in the same commit, and forgetting one of them shipped a
     page nothing linked to. Now the note list is the only place it exists. */
  ...notes.map((note) => ({
    file: `notes/${note.slug}/index.html`,
    url: `/notes/${note.slug}/`,
    render: () => renderNote(note.slug),
    indexable: true
  })),
  { file: 'press/index.html', url: '/press/', render: renderPress, indexable: true },
  { file: 'community/index.html', url: '/community/', render: renderCommunity, indexable: true },
  { file: 'community/questions/index.html', url: '/community/questions/', render: renderCommunityQuestions, indexable: true },
  { file: 'community/ideas/index.html', url: '/community/ideas/', render: renderCommunityIdeas, indexable: true },
  { file: 'community/compatibility/index.html', url: '/community/compatibility/', render: renderCommunityCompatibility, indexable: true },
  { file: 'community/known-issues/index.html', url: '/community/known-issues/', render: renderCommunityKnownIssues, indexable: true },
  { file: 'community/roadmap/index.html', url: '/community/roadmap/', render: renderCommunityRoadmap, indexable: true },
  /* Indexed: false, not because the page is private, but because a search
     result whose destination is the search box helps nobody. It is a real
     page with a canonical and a sitemap entry; it just never matches. */
  { file: 'search/index.html', url: '/search/', render: renderSearch, indexable: true, searchable: false },
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
/* The MixRack release-notice form, its tester-interest form and the
   click-to-play preview moved with the page to studioziomixrack.vercel.app.
   Their scripts and the film left this repository with them; /products/mixrack
   redirects there (see vercel.json). */
// The A/B listener and the renders it plays. Same-origin for the same reason,
// and because `media-src` inherits the `default-src 'self'` in vercel.json.
await cp(resolve(projectRoot, 'src/ab.js'), resolve(outputRoot, 'assets/ab.js'));
// Conversion measurement. One delegated listener, same file on all four
// StudioZIO properties, same-origin for the same CSP reason as the rest.
await cp(resolve(projectRoot, 'src/events.js'), resolve(outputRoot, 'assets/events.js'));
// The reorderable rack on the product cards. Same-origin for the same CSP
// reason; without it the rack is still the right eight modules in order.
await cp(resolve(projectRoot, 'src/rack.js'), resolve(outputRoot, 'assets/rack.js'));
// The search page's matcher. Same-origin for the same CSP reason; it is the
// only script on the site that reads a file rather than sending one.
await cp(resolve(projectRoot, 'src/search.js'), resolve(outputRoot, 'assets/search.js'));
// The header box, on every page: it carries a query to /search/ and does
// nothing else. Same-origin for the same CSP reason as the rest.
await cp(resolve(projectRoot, 'src/header-search.js'), resolve(outputRoot, 'assets/header-search.js'));
// The per-stage oversampling figure's one moving part. Same-origin for the
// same CSP reason; the figure is correct without it.
await cp(resolve(projectRoot, 'src/os-figure.js'), resolve(outputRoot, 'assets/os-figure.js'));
await cp(resolve(projectRoot, 'src/tp-figure.js'), resolve(outputRoot, 'assets/tp-figure.js'));
await cp(resolve(projectRoot, 'src/latency-figure.js'), resolve(outputRoot, 'assets/latency-figure.js'));
await cp(resolve(projectRoot, 'src/delay-lines-figure.js'), resolve(outputRoot, 'assets/delay-lines-figure.js'));
await cp(resolve(projectRoot, 'src/architecture-figure.js'), resolve(outputRoot, 'assets/architecture-figure.js'));
await cp(resolve(projectRoot, 'src/loop-figure.js'), resolve(outputRoot, 'assets/loop-figure.js'));
await cp(resolve(projectRoot, 'src/media'), resolve(outputRoot, 'assets/media'), { recursive: true });
await cp(resolve(projectRoot, 'src/press'), resolve(outputRoot, 'assets/press'), { recursive: true });
/* The search index, assembled here rather than fetched at runtime.

   The hub's own share of it is read out of the HTML this build just rendered,
   so a page and its index entry cannot describe different content -- add a
   note, and it is searchable in the same build that publishes it. The other
   three sites are separate repositories with their own deploys, so their
   share is the committed snapshot in src/search-external.json, refreshed by
   `npm run search:refresh`. That keeps this build offline and deterministic:
   nothing here depends on another site being up at the moment it runs. */
const externalIndex = JSON.parse(
  await readFile(resolve(projectRoot, 'src/search-external.json'), 'utf8')
);

const hubPages = routes
  .filter((route) => route.indexable && route.searchable !== false)
  .map((route) => ({
    site: 'hub',
    siteLabel: 'Hub',
    ...extract(outputs.get(route.file), `${HUB_ORIGIN}${route.url}`)
  }));

await writeFile(
  resolve(outputRoot, 'assets/search-index.json'),
  `${JSON.stringify({
    sites: [{ key: 'hub', label: 'Hub', origin: HUB_ORIGIN }, ...externalIndex.sites],
    externalSnapshotTakenOn: externalIndex.takenOn,
    pages: [...hubPages, ...externalIndex.pages]
  })}\n`,
  'utf8'
);

/* The sitemap now dates the notes. A crawler had no way to tell a note
   written today from one that has sat there for months, because every URL
   arrived without one. Only the notes carry a date, because only the notes
   have one that means anything -- lastmod is optional per URL, and inventing
   a date for the contact page would be worse than leaving it out. */
const noteDates = new Map(notes.map((note) => [`/notes/${note.slug}/`, note.published]));
const indexableRoutes = routes.filter((route) => route.indexable);
const indexableUrls = indexableRoutes.map((route) => `${HUB_ORIGIN}${route.url}`);

await writeFile(
  resolve(outputRoot, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n`
    + `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`
    + indexableRoutes
      .map((route) => {
        const date = noteDates.get(route.url);
        return `  <url>\n    <loc>${HUB_ORIGIN}${route.url}</loc>\n`
          + (date ? `    <lastmod>${date}</lastmod>\n` : '')
          + '  </url>\n';
      })
      .join('')
    + `</urlset>\n`,
  'utf8'
);

/* The notes as a feed. A technical library that can only be read by visiting
   it is a library most of its readers will visit once; this is the standard
   way to be told when there is a new one, and it costs a static file.

   Newest first, by the day each note went up. The description is the note's
   own standfirst -- the feed says what the page says, and nothing more. */
const feedItems = [...notes]
  .sort((a, b) => (a.published < b.published ? 1 : a.published > b.published ? -1 : 0))
  .map((note) => {
    const url = `${HUB_ORIGIN}/notes/${note.slug}/`;
    return `    <item>\n`
      + `      <title>${escapeXml(note.heading)}</title>\n`
      + `      <link>${url}</link>\n`
      + `      <guid isPermaLink="true">${url}</guid>\n`
      + `      <pubDate>${new Date(`${note.published}T09:00:00Z`).toUTCString()}</pubDate>\n`
      + `      <description>${escapeXml(note.standfirst)}</description>\n`
      + `    </item>\n`;
  })
  .join('');

await writeFile(
  resolve(outputRoot, 'feed.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n`
    + `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n`
    + `  <channel>\n`
    + `    <title>StudioZIO technical notes</title>\n`
    + `    <link>${HUB_ORIGIN}/notes/</link>\n`
    + `    <atom:link href="${HUB_ORIGIN}/feed.xml" rel="self" type="application/rss+xml"/>\n`
    + `    <description>Measurement and design notes from StudioZIO: what the plug-ins report, and why they behave that way.</description>\n`
    + `    <language>en</language>\n`
    + feedItems
    + `  </channel>\n`
    + `</rss>\n`,
  'utf8'
);

// robots.txt exists to point crawlers at the sitemap; it had never named one.
await writeFile(
  resolve(outputRoot, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${HUB_ORIGIN}/sitemap.xml\n`,
  'utf8'
);

/* The link checker in validate.mjs deliberately skips /assets/ hrefs, so a
   press kit that failed to copy would ship as a download button leading to a
   404. Check the file the page offers is actually there. */
const pressKit = resolve(outputRoot, 'assets/press', PRESS_KIT_FILE);
if (!existsSync(pressKit)) {
  throw new Error(`The press page offers ${PRESS_KIT_FILE} but the build did not write it to dist/assets/press/`);
}
if (statSync(pressKit).size === 0) {
  throw new Error(`${PRESS_KIT_FILE} copied into dist/assets/press/ as an empty file`);
}

console.log(`Built ${outputs.size} HTML pages and a ${indexableUrls.length}-URL sitemap into dist/`);
