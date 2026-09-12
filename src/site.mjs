import {
  getProduct,
  products,
  MASTERING_SUITE_WEBSITE,
  MIXRACK_WEBSITE,
  RELEASE_REPOSITORY_URL,
  TEMPO_DELAY_WEBSITE,
  ZIO_WEBSITE
} from './catalog.mjs';
import { mediaSeconds } from './media.mjs';
import { notes, getNote } from './notes.mjs';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/* The stylesheet ships under a content-addressed name.

   It used to be a fixed /assets/styles.css with a day-long max-age, which
   meant a deploy could hand a returning visitor the new markup and the old
   stylesheet at the same time -- and it did: the signal-path rail arrived as
   unstyled text and retired colours kept rendering, because the browser was
   still holding yesterday's CSS. A name that changes with the bytes cannot
   be stale, so the pair can never disagree again and the file can be cached
   for a year instead of a day. */
export const STYLESHEET_FILE = `styles-${createHash('sha256')
  .update(readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), 'styles.css')))
  .digest('hex')
  .slice(0, 10)}.css`;
const stylesheet = `/assets/${STYLESHEET_FILE}`;
export const HUB_ORIGIN = 'https://studiozio.vercel.app';
const INSTAGRAM_URL = 'https://www.instagram.com/studio_zio_plugin/';
const YOUTUBE_URL = 'https://www.youtube.com/@StudioZIO-plugins';
const KVR_MASTERING_URL =
  'https://www.kvraudio.com/product/studiozio-mastering-suite-by-studiozio';
const KVR_TEMPO_URL =
  'https://www.kvraudio.com/product/studiozio-tempo-delay-by-studiozio';
const HOMEBREW_URL = 'https://brew.sh/';
const HOMEBREW_CASKS = Object.freeze({
  'mastering-suite': 'studiozio-mastering-suite',
  'tempo-delay': 'studiozio-tempo-delay'
});

function homebrewInstall(product) {
  const cask = HOMEBREW_CASKS[product.slug];
  if (!cask) return '';
  return `<p class="form-hint">Alternative: <a href="${HOMEBREW_URL}">Homebrew</a> · <code>brew tap StudioZIO/studiozio &amp;&amp; brew install --cask ${cask}</code></p>`;
}

/* Google tag for the "Hub" data stream of the StudioZIO Analytics property.
   Three files, in this order, because the site is served under
   `default-src 'self'` with no 'unsafe-inline':
     1. gtag.js - Google's inline half, moved to a same-origin file. It runs
                  synchronously, so the Consent Mode defaults are established
                  before the loader can send anything.
     2. the googletagmanager loader - kept as the literal tag that Google's
                  own installation check looks for.
     3. consent.js - the banner, deferred so the footer it hangs the withdraw
                  control on already exists.
   scripts/validate.mjs asserts all three on every page, so a page that ever
   stops carrying the tag fails the build instead of shipping untracked. */
const MEASUREMENT_ID = 'G-VL8Z542XMP';
const analytics = `<script src="/assets/gtag.js"></script>
  <script async src="https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}"></script>
  <script src="/assets/consent.js" defer></script>
  <script src="/assets/events.js" defer></script>
  <script src="/assets/header-search.js" defer></script>`;

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatList(items) {
  return items.map((item) => escapeHtml(item)).join(' · ');
}

/* ---------- shared primitives ------------------------------------------ */

// The single StudioZIO lockup: waveform mark on an overlay tile, "Studio" in
// the foreground colour, "ZIO" in the accent, optional mono product suffix.
function logo({ href = '/', suffix = '', link = true } = {}) {
  // The accessible name has to contain the visible text. The wordmark and the
  // suffix are separate elements, so the label is built from the same pieces
  // and the markup carries a real space between them.
  const label = `StudioZIO${suffix ? ` ${suffix}` : ''}`;
  const open = link
    ? `<a class="logo" href="${escapeHtml(href)}" aria-label="${escapeHtml(label)}">`
    : '<span class="logo">';
  const close = link ? '</a>' : '</span>';
  return `${open}
      <span class="logo-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M2 12h3l2.6-7.2L11 19l3-9 2.4 4.4H22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
      <span class="logo-word">Studio<b>ZIO</b></span>
      ${suffix ? ` <span class="logo-suffix">${escapeHtml(suffix)}</span>` : ''}
    ${close}`;
}

/* The artist site and this one are two entities: ZIO is a Person, StudioZIO
   an Organization, and the graphs on both properties model them that way,
   linked only by founder. Until now that relationship existed solely in
   structured data with no crawlable link either way, and the two copies of
   the shared Organization @id did not even agree — the artist site's copy
   named a founder, this one's did not. A claim asserted in JSON-LD and
   corroborated by nothing is the weakest form of it.
   The link is appended to the footer list rather than added to NAVIGATION,
   because NAVIGATION renders the header too and ZIO is not a StudioZIO
   product. Inside the existing <ul> it inherits the footer nav's styling and
   adds no new flex child to .inner, so nothing about the layout moves. */
function instagramLink() {
  return `<a class="social-link" href="${INSTAGRAM_URL}" target="_blank" rel="noopener noreferrer" aria-label="Instagram — studio_zio_plugin">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" stroke-width="1.8"/>
          <circle cx="12" cy="12" r="4.2" stroke="currentColor" stroke-width="1.8"/>
          <circle cx="17.4" cy="6.7" r="1.1" fill="currentColor"/>
        </svg>
      </a>`;
}

function youtubeLink() {
  return `<a class="social-link" href="${YOUTUBE_URL}" target="_blank" rel="noopener noreferrer" aria-label="YouTube — @StudioZIO-plugins">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="2.5" y="5.5" width="19" height="13" rx="3.5" stroke="currentColor" stroke-width="1.8"/>
          <path d="M10.5 9.3v5.4l4.7-2.7-4.7-2.7z" fill="currentColor"/>
        </svg>
      </a>`;
}

function kvrLink(url, label) {
  return `<a class="kvr-link" href="${url}" target="_blank" rel="noopener noreferrer" aria-label="${label} — KVR Audio" title="${label} — KVR Audio">
        <svg viewBox="0 0 42 22" aria-hidden="true">
          <text x="1" y="16" fill="currentColor" font-family="monospace" font-size="13" font-weight="700" letter-spacing="1">KVR</text>
        </svg>
      </a>`;
}

const NAVIGATION = [
  ['Hub', '/', 'hub'],
  ['Products', '/products/', 'products'],
  ['Notes', '/notes/', 'notes'],
  ['Contact', '/contact/', 'contact']
];

/* The three product sites left this row. Eight destinations and the search
   box did not fit on one line -- the labels folded onto a second row and the
   header grew by a third -- and the owner's call was that the products belong
   behind Products, where the catalogue describes them, rather than repeated
   in every header. Anyone who knows the product name types it in the box.
   The same five entries ship on all four StudioZIO sites. */
const HEADER_NAVIGATION = [
  ['Hub', '/', 'hub'],
  ['Products', '/products/', 'products'],
  ['Notes', '/notes/', 'notes'],
  ['Community', '/community/', 'community'],
  ['Contact', '/contact/', 'contact']
];

/* The header carries the search box itself rather than a link to it: the
   index covers all four properties, so the useful thing to put in front of a
   visitor is the box, not another word to click. Two copies ship -- one in
   the row, one inside the compact menu -- because the row is hidden on a
   phone and the box should not be. Enter is handled by header-search.js;
   there is no <form> because form-action is 'none'. */
function headerSearch(variant) {
  return `<div class="header-search${variant ? ` header-search--${variant}` : ''}">
          <input class="field header-search-field" type="search" name="q" aria-label="Search StudioZIO" placeholder="Search" autocomplete="off" autocapitalize="off" spellcheck="false">
        </div>`;
}

/* The three product sites live in the header, one row up, and the footer
   carries none of them: with MixRack added the footer would have listed the
   same three destinations twice on one screen. The owner asked for the
   shorter list, and the same two lists now ship on every StudioZIO site, so
   any menu is still reachable from any surface.
   The press kit and the artist site sit here rather than in the header:
   journalists go looking for the first and customers never do, and ZIO is a
   Person the Organization graph names as founder, not a product. A footer
   entry still puts a link on every page of the site, which is the part the
   crawler needs. */
const FOOTER_LINKS = [
  ...NAVIGATION,
  ['Press kit', '/press/', 'press'],
  ['ZIO', ZIO_WEBSITE, 'zio']
];

function navList(current, entries = NAVIGATION) {
  return entries.map(
    ([label, href, id]) =>
      `<li><a href="${escapeHtml(href)}"${
        current === id ? ' aria-current="page"' : ''
      }>${escapeHtml(label)}</a></li>`
  ).join('');
}

function chip(label, tone = '') {
  return `<span class="chip${tone ? ` chip--${tone}` : ''}">${
    tone === 'flag' || tone === 'destructive' || tone === 'closed'
      ? '<span class="dot" aria-hidden="true"></span>'
      : ''
  }${escapeHtml(label)}</span>`;
}

const DEFAULT_SOCIAL_IMAGE = '/assets/og/og-studiozio.png';

const FREE_PROMISE = 'No account, no iLok, no email registration. Signed and notarised.';

export const ORGANIZATION_ID = `${HUB_ORIGIN}/#organization`;

/* Structured data ships as a data island, not executable code. The site's CSP
   has no 'unsafe-inline' for scripts, which is why every other script here is
   a separate file -- but script-src governs execution, and a ld+json block is
   never executed. Verified against this site's own production CSP: the block
   loads with zero violations and parses in the DOM. */
function jsonLdBlock(graph) {
  const serialised = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2);
  if (serialised.includes('</')) throw new Error('JSON-LD payload would break out of its script element');
  return `<script type="application/ld+json">\n${serialised}\n  </script>`;
}

const organizationNode = {
  '@type': 'Organization',
  '@id': `${HUB_ORIGIN}/#organization`,
  name: 'StudioZIO',
  url: `${HUB_ORIGIN}/`,
  description:
    'Independent audio software company building native Audio Unit, VST3, AAX and Standalone plug-ins for macOS.',
  logo: `${HUB_ORIGIN}/assets/og/og-studiozio.png`,
  /* The artist site's copy of this same @id already named this founder. Both
     copies now say it, so the two properties describe one Organization
     consistently instead of one of them making a claim the other omits. The
     @id is a reference, not a definition: ZIO the Person is defined on the
     artist site, and the footer link above is what makes the reference
     crawlable. */
  founder: { '@id': 'https://zio-audio.vercel.app/#person' }
};

const homeJsonLd = () =>
  jsonLdBlock([
    organizationNode,
    {
      '@type': 'WebSite',
      '@id': `${HUB_ORIGIN}/#website`,
      url: `${HUB_ORIGIN}/`,
      name: 'StudioZIO',
      inLanguage: 'en',
      publisher: { '@id': `${HUB_ORIGIN}/#organization` }
    }
  ]);

const productsJsonLd = () => jsonLdBlock([
  organizationNode,
  {
    '@type': 'CollectionPage',
    '@id': `${HUB_ORIGIN}/products/#page`,
    url: `${HUB_ORIGIN}/products/`,
    name: 'StudioZIO products',
    publisher: { '@id': ORGANIZATION_ID },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: products.length,
      itemListElement: products.map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'SoftwareApplication',
          name: product.name,
          url: new URL(product.detailsUrl, HUB_ORIGIN).href,
          description: `${product.description} ${product.availability}.`,
          operatingSystem: product.platform,
          applicationCategory: 'MultimediaApplication',
          ...(product.version ? { softwareVersion: product.version } : {}),
          publisher: { '@id': ORGANIZATION_ID }
        }
      }))
    }
  }
]);

function shell({ title, description, canonical, current, content, scripts = '', socialImage = DEFAULT_SOCIAL_IMAGE, socialImageAlt = 'StudioZIO — audio plug-ins for macOS', jsonLd = '' }) {
  const image = `${HUB_ORIGIN}${socialImage}`;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#0b1013">
  <!-- Google Search Console ownership. Removing this un-verifies the
       property and silently stops the indexing and canonical reports. -->
  <meta name="google-site-verification" content="aXMQpgJhgbtlNAKPjP751z9uU3gJMCb8X_LJwqav5Oc">
  <meta name="description" content="${escapeHtml(description)}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="StudioZIO">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  ${canonical ? `<meta property="og:url" content="${escapeHtml(canonical)}">
  <link rel="canonical" href="${escapeHtml(canonical)}">` : ''}
  <meta property="og:image" content="${escapeHtml(image)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${escapeHtml(socialImageAlt)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(image)}">
  <meta name="twitter:image:alt" content="${escapeHtml(socialImageAlt)}">
  <title>${escapeHtml(title)}</title>
  <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="${stylesheet}">
  <link rel="preload" href="/assets/fonts/space-grotesk-700.woff2" as="font" type="font/woff2" crossorigin>
  ${analytics}
  ${jsonLd}
  ${scripts}
</head>
<body>
  <a class="skip-link" href="#main-content">Skip to content</a>
  <header class="site-header">
    <div class="shell bar">
      ${logo()}
      <nav class="nav-links" aria-label="Primary">
        <ul>${navList(current, HEADER_NAVIGATION)}</ul>
      </nav>
      ${headerSearch('bar')}
      <details class="nav-compact">
        <summary aria-label="Menu" aria-controls="compact-menu"><span class="open" aria-hidden="true">≡</span><span class="shut" aria-hidden="true">×</span></summary>
        <nav class="panel" id="compact-menu" aria-label="Primary">
          ${headerSearch('panel')}
          <ul>${navList(current, HEADER_NAVIGATION)}</ul>
        </nav>
      </details>
    </div>
  </header>
  <main id="main-content">${content}</main>
  <footer class="site-footer">
    <div class="shell inner">
      <div class="footer-brand">
        ${logo()}
        <div class="footer-tools">
          ${youtubeLink()}
          ${instagramLink()}
          ${kvrLink(KVR_MASTERING_URL, 'Mastering Suite')}
          ${kvrLink(KVR_TEMPO_URL, 'Tempo Delay')}
        </div>
      </div>
      <nav aria-label="Footer">
        <ul>${navList(current, FOOTER_LINKS)}</ul>
      </nav>
      <p class="copy">© 2026</p>
    </div>
  </footer>
</body>
</html>`;
}

/* ---------- live plugin mocks ------------------------------------------
   Each mock is the plug-in's own organising idea, not a drawing of knobs the
   product does not have: a signal-path rail whose stages light in the order
   the audio takes them, exactly as the real window presents itself. Values
   are the shipped defaults, so the rail and the screenshot further down the
   page agree. Marked decorative: every load-bearing fact is in the card body. */

/** One rail. `stages` is [label, value] in signal order; the arming sweep is
    driven by nth-child delays in the stylesheet, keyed off the stage count. */
function signalRail(stages) {
  const cells = stages
    .map(
      ([label, value]) => `<span class="st">
          <span class="k">${escapeHtml(label)}</span>
          <span class="v">${escapeHtml(value)}</span>
        </span>`
    )
    .join('');
  return `<div class="rail-head"><span>Signal path</span><span>in the order the audio takes</span></div>
      <div class="rail rail--${stages.length}">${cells}</div>`;
}

function masteringSuiteMock() {
  /* The nine APVTS stages, in the plug-in's own order. */
  const stages = [
    ['M/S', '0 %'],
    ['Sat', 'Off'],
    ['Pink', '60 %'],
    ['Glue', '-0.4'],
    ['Max', '0 %'],
    ['EQ', '0.0'],
    ['Clip', '-3.0'],
    ['Limit', '-0.30'],
    ['Out', '-14.3']
  ];
  /* Ten bars, one per band the learned correction reports. */
  const bands = ['31', '63', '125', '250', '500', '1k', '2k', '4k', '8k', '16k'];
  return `<div class="mock" aria-hidden="true">
      <div class="mock-head">
        <span class="mock-title"><span class="dot"></span>Mastering Suite</span>
        <span class="chip-row">${chip('AU · VST3 · AAX')}${chip('Notarized', 'flag')}</span>
      </div>
      <div class="mock-body">
        ${signalRail(stages)}
        <div class="bands">
          <span class="bands-head"><span>Learned correction · per band</span><span>target -14 LUFS</span></span>
          <span class="bands-row">${bands.map(() => '<i></i>').join('')}</span>
          <span class="bands-scale">${bands
            .map((b) => `<span>${b}</span>`)
            .join('')}</span>
        </div>
      </div>
    </div>`;
}

function tempoDelayMock() {
  /* The eight stages the window puts across the top, left to right. Values
     are the plug-in's APVTS defaults, which is what its own parameter guide
     publishes; the shipped screenshot is captured on the "Default Stereo
     Delay" preset and differs on feedback, mix and delay times. */
  const stages = [
    ['Tempo', '120.0'],
    ['Left', '1/8D'],
    ['Right', '1/8'],
    ['Tone', '80-8k'],
    ['Fdbk', '40 %'],
    ['Char', 'Digital'],
    ['Width', '100 %'],
    ['Mix', '35 %']
  ];
  return `<div class="mock" aria-hidden="true">
      <div class="mock-head">
        <span class="mock-title"><span class="dot"></span>Tempo Delay</span>
        <span class="chip-row">${chip('AU · VST3 · AAX')}${chip('Host sync', 'flag')}</span>
      </div>
      <div class="mock-body">
        ${signalRail(stages)}
        <div class="echo">
          <span class="echo-corr">
            <span class="echo-label"><span>Stereo echo field</span><span>correlation +1.00</span></span>
            <span class="echo-bar"><i></i></span>
          </span>
          <span class="echo-big">100<small>ms L / R</small></span>
        </div>
      </div>
    </div>`;
}

const MOCKS = {
  'mastering-suite': masteringSuiteMock,
  'tempo-delay': tempoDelayMock
};

/* ---------- A/B listening -----------------------------------------------
   Two renders of one passage — unprocessed, and through the plug-in — each
   normalised to -12.0 LUFS integrated with peaks at or below -1 dBTP,
   measured on the encodes the browser actually plays rather than on the
   masters. At different levels the louder take always wins and the
   comparison says nothing, so the matching is the feature.

   Each card also carries a capture of the plug-in that made the render,
   cropped to the plug-in's own window, so the sound and the surface arrive
   together. Two sources per take: Opus for the browsers that have it, AAC
   for the Safari releases that do not.

   The behaviour lives in src/ab.js; the markup here only supplies the hooks
   that file reads. */

const AB_DEMOS = Object.freeze({
  'mastering-suite': Object.freeze({
    title: 'Mastering Suite · unmastered vs mastered',
    group: 'Compare the unmastered and mastered renders',
    processedLabel: 'Mastered',
    dry: '/assets/media/master-dry',
    wet: '/assets/media/master-wet',
    shot: 'mastering-suite-ui',
    shotWidth: 1440,
    shotHeight: 760,
    shotWidths: Object.freeze([640, 1024, 1440]),
    shotAlt:
      'The StudioZIO Mastering Suite window: a signal-path rail across the top running M/S engine, saturation, pink match, glue, maximizer, tone EQ, clipper and limiter, with the Pink Match stage open at 60 per cent against a Hip-Hop target, and a meter column on the right reading -14.3 LUFS integrated against a -14 target, with true-peak bars and stereo correlation.',
    note:
      '“Güvercinler”, a StudioZIO production, rendered through Mastering Suite 2.0.0. Judge tone, depth and stability.'
  }),
  'tempo-delay': Object.freeze({
    title: 'Tempo Delay · dry vs delayed',
    group: 'Compare the dry and delayed renders',
    processedLabel: 'Delayed',
    dry: '/assets/media/delay-dry',
    wet: '/assets/media/delay-wet',
    shot: 'tempo-delay-ui',
    shotWidth: 1440,
    shotHeight: 760,
    shotWidths: Object.freeze([640, 1024, 1440]),
    shotAlt:
      'The StudioZIO Tempo Delay window: a signal-path rail across the top running tempo, left, right, tone, feedback, character, width and mix, with the primary delay engine open at 100 ms on each side, 45 per cent feedback, 100 per cent width and 50 per cent mix, a stereo echo field on the right, and the tone and filters tab showing an 80 Hz high-pass and an 8 kHz low-pass.',
    note:
      'Rendered through Tempo Delay 4.0.1 at 44.1 kHz. Judge placement, tail and stereo spread.'
  })
});

/* The capture is rendered about 545 CSS px wide inside a two-column grid, and
   full width below the 900px breakpoint where that grid collapses. Serving the
   1440px master to a 545px slot was most of a megapixel thrown away on every
   visit; the browser now picks from the variants and takes the master only on a
   wide, high-density screen.

   The master keeps its plain filename so its <src> stays a working fallback for
   anything that ignores srcset, and so the social-card and JSON-LD references
   to it do not have to move. */
function shotSrcset(demo) {
  return demo.shotWidths
    .map((width) => {
      const file = width === demo.shotWidth ? demo.shot : `${demo.shot}-${width}`;
      return `/assets/media/${file}.webp ${width}w`;
    })
    .join(', ');
}

function abCard(key) {
  const demo = AB_DEMOS[key];
  const sources = (base) =>
    `<source src="${base}.opus" type="audio/ogg; codecs=opus">
        <source src="${base}.m4a" type="audio/mp4; codecs=mp4a.40.2">`;

  // The length comes from the file, not from the browser: see src/media.mjs.
  const seconds = mediaSeconds(demo.wet.split('/').pop());

  return `<article class="panel-float ab-card" data-ab="card" data-length="${seconds.toFixed(3)}">
      <audio data-take="dry" preload="none" loop crossorigin="anonymous">
        ${sources(demo.dry)}
      </audio>
      <audio data-take="wet" preload="none" loop crossorigin="anonymous">
        ${sources(demo.wet)}
      </audio>
      <div class="ab-head">
        <span class="ab-title">${escapeHtml(demo.title)}</span>
        <span class="ab-flag">Real render · matched −12 LUFS</span>
      </div>
      <img class="ab-shot" src="/assets/media/${demo.shot}.webp"
        srcset="${shotSrcset(demo)}"
        sizes="(min-width: 900px) 545px, calc(100vw - 3rem)"
        width="${demo.shotWidth}" height="${demo.shotHeight}" decoding="async" loading="lazy"
        alt="${escapeHtml(demo.shotAlt)}">
      <div class="ab-transport">
        <button type="button" class="btn btn-primary ab-play" data-ab="play" aria-pressed="false"><span data-ab="play-label">Hear it</span></button>
        <div class="ab-takes" role="group" aria-label="${escapeHtml(demo.group)}">
          <button type="button" data-ab="take" aria-pressed="false"
            data-event="ab_toggle" data-ev-take="dry" data-ev-product="${key}">Dry</button>
          <button type="button" data-ab="take" aria-pressed="true"
            data-event="ab_toggle" data-ev-take="processed" data-ev-product="${key}">${escapeHtml(
            demo.processedLabel
          )}</button>
        </div>
        <div class="ab-readout">
          <div class="ab-meter" data-ab="meter"><span class="ab-meter-fill" data-ab="meter-fill"></span></div>
          <div class="ab-scale">
            <span class="ab-key">Output</span>
            <span class="ab-progress" data-ab="progress" role="progressbar" aria-label="Position in the passage" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span class="ab-progress-fill" data-ab="progress-bar"></span></span>
          </div>
        </div>
      </div>
      <p class="ab-foot">${escapeHtml(demo.note)}</p>
    </article>`;
}

function hearItFirst() {
  return `<section class="section" id="listen" aria-labelledby="listen-title">
      <div class="shell">
        <div class="section-head">
          <p class="eyebrow">Hear it first</p>
          <h2 id="listen-title">Both plug-ins, dry and processed</h2>
          <p class="lede">Real renders from the plug-ins, switched instantly so the playhead never moves. Both takes in each pair are matched to −12.0 LUFS integrated with peaks at or below −1 dBTP, because at different levels the louder one always wins and the comparison tells you nothing.</p>
        </div>
        <div class="card-grid card-grid--2">${abCard('mastering-suite')}${abCard(
          'tempo-delay'
        )}</div>
      </div>
    </section>`;
}

const AB_SCRIPT = '<script src="/assets/ab.js" defer></script>';

/* ---------- cards ------------------------------------------------------- */

function productCard(product) {
  /* A release flag is any status that is not simply shipping -- "Coming
     soon" and "Release candidate" alike. It is marked by the chip's dot, not
     by a second accent hue: the plug-in windows themselves are single-accent,
     so the sites are too. */
  const isShipping = product.availability === 'Available now';
  const mock = MOCKS[product.slug];
  const detailsLabel = product.externalDetails ? 'Open product site' : 'Open product page';
  const chips = [
    product.version ? chip(`v${product.version}`) : '',
    product.price ? chip(product.price) : '',
    chip(product.compactFormats.replaceAll(' / ', ' · ')),
    product.architecture ? chip(product.architecture.split(' —')[0]) : '',
    isShipping ? chip(product.availability) : chip(product.availability, 'flag')
  ].join('');

  return `<article class="panel product-card">
      ${mock ? mock() : ''}
      <div class="card-body">
        <div class="card-title-row">
          <h3>${escapeHtml(product.name)}</h3>
        </div>
        <p>${escapeHtml(product.description)}</p>
        <div class="chip-row">${chips}</div>
        <a class="btn" href="${escapeHtml(product.detailsUrl)}">${detailsLabel}</a>
        ${isShipping ? homebrewInstall(product) : ''}
        ${product.price === 'Free' ? `<p class="form-hint">${escapeHtml(FREE_PROMISE)}</p>` : ''}
      </div>
    </article>`;
}

/* The shared behaviour both plugins are built on. Each product site carries
   its own four claims; these are the ones that are true of both, so the hub is
   the only place they are stated. Every claim is paired with a value the
   plugin reports, because a claim without its number is the thing these tools
   exist not to do. */
const claims = [
  {
    title: 'You never have to trust your ears alone',
    body: 'Momentary, short-term and integrated loudness, loudness range, crest factor, sample peak, true peak and stereo correlation update while you work. No second plugin, no bouncing to check.',
    key: 'Live readouts',
    value: 'LUFS M · S · I · LRA · CREST · TP · CORR'
  },
  {
    title: 'Louder is not allowed to win',
    body: 'Gain match levels the bypassed and processed paths before you compare, and delta monitoring plays only what the chain added. Both exist because an unmatched A/B always flatters the louder side, whatever it actually did to the sound.',
    key: 'Controls',
    value: 'GAIN MATCH · DELTA · RESET LUFS'
  },
  {
    title: 'Automation is a first-class surface',
    body: 'Every control is a parameter with a stable identifier, so automation lanes, macro mappings and saved sessions survive updates instead of silently re-binding.',
    key: 'Tempo Delay',
    value: '32 automatable parameters'
  },
  {
    title: 'Nothing allocates on the audio thread',
    body: 'Bypass is crossfaded rather than switched, so engaging it produces no transient. Filter cutoffs cannot cross and destabilise the loop. These are the parts nobody demos and everybody notices.',
    key: 'Engine',
    value: 'REALTIME SAFE · CROSSFADED BYPASS'
  }
];

function claim({ title, body, key, value }) {
  return `<div class="claim">
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(body)}</p>
        <dl class="claim-readout">
          <dt>${escapeHtml(key)}</dt>
          <dd>${escapeHtml(value)}</dd>
        </dl>
      </div>`;
}

function downloadComponent(product) {
  return `<section class="section" aria-labelledby="download-title">
      <div class="shell">
        <div class="panel-float download-row">
          <div>
            <p class="eyebrow">Official macOS installer</p>
            <h2 id="download-title">${escapeHtml(product.shortName)} ${escapeHtml(product.version)}</h2>
            <p class="lede">Version ${escapeHtml(product.version)} · ${formatList(product.formats)}</p>
            <div class="chip-row mt-sm">
              ${chip(product.signing)}${chip(product.notarization, 'flag')}
            </div>
          </div>
          <div class="actions">
            <a class="btn btn-primary" href="${escapeHtml(product.downloadUrl)}">Download for macOS</a>
            <a class="btn" href="${escapeHtml(TEMPO_DELAY_WEBSITE)}">Try Tempo Delay</a>
          </div>
        </div>
        <dl class="spec-grid mt-md">
          <div><dt>Installer</dt><dd><code>${escapeHtml(product.filename)}</code></dd></div>
          <div><dt>Platform</dt><dd>${escapeHtml(product.platform)}</dd></div>
          <div><dt>SHA-256</dt><dd class="sha">${escapeHtml(product.sha256)}</dd></div>
        </dl>
      </div>
    </section>`;
}

/* ---------- pages ------------------------------------------------------- */

export function renderHome() {
  return shell({
    title: 'StudioZIO — Audio Plugins Built on Visible Signal Flow',
    description:
      'StudioZIO Mastering Suite and StudioZIO Tempo Delay for macOS in AU, VST3, AAX and Standalone, plus the upcoming StudioZIO MixRack.',
    canonical: `${HUB_ORIGIN}/`,
    current: 'hub',
    jsonLd: homeJsonLd(),
    scripts: AB_SCRIPT,
    content: `<section class="hero tech-grid">
      <div class="shell">
        <div class="hero-grid hero--stacked">
          <div class="rise">
            <p class="eyebrow">Plug-ins for macOS</p>
            <h1>Tools that behave like <span class="accent">hardware you trust.</span></h1>
            <p class="lede">Two available instruments and one in development, in one interface language. Everything you touch moves, meters and reports the value it is actually applying.</p>
            <div class="hero-actions">
              <a class="btn btn-primary" href="${escapeHtml(MASTERING_SUITE_WEBSITE)}">Mastering Suite</a>
              <a class="btn" href="${escapeHtml(TEMPO_DELAY_WEBSITE)}">Tempo Delay</a>
              <span class="chip chip--bare chip--flag"><span class="dot" aria-hidden="true"></span>Notarized builds</span>
            </div>
          </div>
        </div>
      </div>
    </section>
    ${hearItFirst()}
    <section class="section" aria-labelledby="catalog-title">
      <div class="shell">
        <div class="section-head">
          <p class="eyebrow">Catalog</p>
          <h2 id="catalog-title">The instruments</h2>
          <p class="lede">Mastering Suite and Tempo Delay are available now as signed macOS installers. StudioZIO MixRack is coming soon.</p>
          <p><a href="/products/">Explore all StudioZIO products</a></p>
        </div>
        <div class="card-grid card-grid--2">${products.map(productCard).join('')}</div>
      </div>
    </section>
    <section class="section" aria-labelledby="through-line-title">
      <div class="shell">
        <div class="section-head">
          <p class="eyebrow">The through-line</p>
          <h2 id="through-line-title">Measurement is not a separate product</h2>
          <p class="lede">The industry sells you a processor, then sells you a meter to find out what the processor did. StudioZIO puts both on one surface, and makes the honest comparison the default one.</p>
        </div>
        <div class="claims">${claims.map(claim).join('')}</div>
      </div>
    </section>`
  });
}

export function renderProducts() {
  return shell({
    title: 'Audio plugins for macOS — StudioZIO Products',
    description: 'Explore StudioZIO Mastering Suite and Tempo Delay for macOS, compare formats and availability, and learn about the upcoming StudioZIO MixRack.',
    canonical: `${HUB_ORIGIN}/products/`,
    current: 'products',
    jsonLd: productsJsonLd(),
    content: `<section class="hero tech-grid">
      <div class="shell">
        <div class="rise">
          <p class="eyebrow">StudioZIO software</p>
          <h1>Audio plugins for macOS</h1>
          <p class="lede">Mastering Suite and Tempo Delay are available now. Explore each product's formats and Mac compatibility, or follow the upcoming StudioZIO MixRack.</p>
        </div>
      </div>
    </section>
    <section class="section" aria-labelledby="catalog-title">
      <div class="shell">
        <div class="section-head">
          <p class="eyebrow">Products</p>
          <h2 id="catalog-title">Choose your instrument</h2>
          <p class="lede">Open a product site for its installer, documentation and release details. MixRack is in development and has no release date yet.</p>
        </div>
        <div class="card-grid card-grid--2">${products.map(productCard).join('')}</div>
        <p class="mt-lg">Hear Mastering Suite and Tempo Delay on the <a href="/">Hub</a>, or <a href="/contact/">contact StudioZIO</a> for help choosing a product.</p>
      </div>
    </section>`
  });
}

/* The one page on the hub that takes input rather than giving it. The form
   posts through src/contact.js; the CSP allows that single endpoint and
   nothing else, and blocks a native POST entirely, so there is no quiet path
   for a message to leave this page by. */
export function renderContact() {
  return shell({
    title: 'Contact and support — StudioZIO',
    description:
      'Reach the people who build StudioZIO Mastering Suite and Tempo Delay: bug reports, host compatibility and setup questions.',
    canonical: `${HUB_ORIGIN}/contact/`,
    current: 'contact',
    scripts: '<script src="/assets/contact.js" defer></script>',
    content: `<section class="hero tech-grid">
      <div class="shell">
        <div class="rise">
          <p class="eyebrow">Support</p>
          <h1>Talk to the people who build it</h1>
          <p class="lede">Bug reports, host compatibility and setup questions all reach the same desk. Most answers go out within 24&ndash;48 business hours.</p>
          <p>For installers and product documentation, start with the <a href="/products/">product catalogue</a>.</p>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="shell">
        <form class="panel-float support-form" novalidate="false">
          <div class="form-hp" aria-hidden="true">
            <label for="company">Company</label>
            <input id="company" name="company" type="text" tabindex="-1" autocomplete="off">
          </div>

          <div class="form-grid form-grid--2">
            <div class="form-row">
              <label class="form-label" for="name">Name <span class="req">required</span></label>
              <input id="name" name="name" class="field" type="text" required autocomplete="name">
            </div>
            <div class="form-row">
              <label class="form-label" for="email">Email <span class="req">required</span></label>
              <input id="email" name="email" class="field" type="email" required autocomplete="email">
              <p class="form-hint">The only address the reply can reach.</p>
            </div>
          </div>

          <div class="form-grid form-grid--3">
            <div class="form-row">
              <label class="form-label" for="category">Category</label>
              <select id="category" name="category" class="field">
                <option value="Technical support">Technical support</option>
                <option value="DAW compatibility">DAW compatibility</option>
                <option value="Bug report">Bug report</option>
                <option value="Feature inquiry">Feature inquiry</option>
                <option value="Licence and download">Licence and download</option>
              </select>
            </div>
            <div class="form-row">
              <label class="form-label" for="os">Operating system</label>
              <input id="os" name="os" class="field field-mono" type="text" placeholder="macOS 14">
            </div>
            <div class="form-row">
              <label class="form-label" for="daw">Host DAW</label>
              <input id="daw" name="daw" class="field field-mono" type="text" placeholder="Logic Pro">
            </div>
          </div>

          <div class="form-row">
            <label class="form-label" for="message">Message <span class="req">required</span></label>
            <textarea id="message" name="message" class="field field-area" rows="7" required></textarea>
            <p class="form-hint">For a bug, the host, its version and what you did before it happened get to an answer fastest.</p>
          </div>

          <p class="form-status" role="status" aria-live="polite"></p>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Send message</button>
          </div>
        </form>

        <noscript>
          <p class="form-note">This form needs JavaScript to send. With it switched off nothing is submitted, so please enable it for this page rather than assuming a message went through.</p>
        </noscript>
      </div>
    </section>`
  });
}

/* ---------- search ------------------------------------------------------
   One box for four properties. The estate is small enough that a visitor can
   reach any page from the header, and too spread out to answer a question
   like "where does it say what EXPECTED TP means" without opening three
   sites. So the index covers all four and the page lives here, on the hub,
   which is the only property that already speaks for the others.

   It runs entirely in the browser: search.js downloads one JSON file from
   this origin and matches against it locally. Nothing typed here is sent
   anywhere, there is no search backend, and the CSP's connect-src stays
   'self'. There is deliberately no <form>: the CSP sets form-action 'none',
   and a form that cannot submit is a promise the page could not keep. */

export function renderSearch() {
  return shell({
    title: 'Search every StudioZIO page — StudioZIO',
    description:
      'Search every StudioZIO page at once: the hub, the Mastering Suite site, Tempo Delay and MixRack. It runs in your browser, with no query sent anywhere.',
    canonical: `${HUB_ORIGIN}/search/`,
    current: 'search',
    scripts: '<script src="/assets/search.js" defer></script>',
    content: `<section class="hero tech-grid">
      <div class="shell">
        <div class="rise">
          <p class="eyebrow">Search</p>
          <h1>One box, every StudioZIO page</h1>
          <p class="lede">The hub, the Mastering Suite site, Tempo Delay and MixRack are indexed together. The search runs in your browser: what you type stays on your machine.</p>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="shell">
        <div class="panel-float">
          <div class="form-row">
            <label class="form-label" for="search-query">Search StudioZIO</label>
            <input id="search-query" class="field" type="search" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="oversampling, AAX, latency, install&hellip;">
            <p class="form-hint">Results appear as you type. Two letters are enough to start.</p>
          </div>
          <p class="result-status" id="search-status" role="status" aria-live="polite"></p>
        </div>
        <div class="card-grid card-grid--2 mt-lg" id="search-results"></div>
        <noscript>
          <p class="mt-lg">Search needs JavaScript, because the index is matched in your browser rather than on a server. Without it, the <a href="/notes/">technical notes</a>, the <a href="/products/">product catalogue</a> and the <a href="/community/">community pages</a> are the places to look, and <a href="/contact/">support</a> will answer a question directly.</p>
        </noscript>
      </div>
    </section>`
  });
}

export function renderNotFound() {
  return shell({
    title: 'Page not found — StudioZIO',
    description: 'The requested StudioZIO page could not be found.',
    current: '',
    content: `<section class="hero tech-grid">
      <div class="shell">
        <p class="eyebrow">404</p>
        <h1>Page not found</h1>
        <p class="lede">The requested page is not available.</p>
        <div class="hero-actions"><a class="btn btn-primary" href="/">Return to the hub</a></div>
      </div>
    </section>`
  });
}


/* ---------- technical notes ---------------------------------------------
   Things the plug-ins assert on their own surface -- that EXPECTED TP is a
   ceiling-derived reference, that oversampling is set per stage, that
   AAX support and Pro Tools validation -- explained somewhere that is not a product
   page. The list lives in notes.mjs and the routes, the sitemap and the
   validator are all derived from it, so they cannot disagree about which
   notes exist. */

function noteCard(note) {
  return `<article class="panel module-card">
          <h3><a href="/notes/${escapeHtml(note.slug)}/">${escapeHtml(note.heading)}</a></h3>
          <p>${escapeHtml(note.standfirst)}</p>
        </article>`;
}

export function renderNotes() {
  return shell({
    title: 'Technical notes — StudioZIO',
    description:
      'Technical notes from StudioZIO on true-peak limiting, oversampling, delay design and AAX support: what the plug-ins report, and why they behave that way.',
    canonical: `${HUB_ORIGIN}/notes/`,
    current: 'notes',
    content: `<section class="hero tech-grid">
      <div class="shell">
        <div class="rise">
          <p class="eyebrow">StudioZIO</p>
          <h1>Technical notes</h1>
          <p class="lede">The plug-ins report a few things that look odd until you know why. These are the explanations, written out rather than left on a product page.</p>
        </div>
      </div>
    </section>
    <section class="section" aria-labelledby="notes-title">
      <div class="shell">
        <div class="section-head">
          <p class="eyebrow">Notes</p>
          <h2 id="notes-title">Measurement and design, explained</h2>
        </div>
        <div class="card-grid card-grid--2">${notes.map(noteCard).join('')}</div>
        <p class="mt-lg">More about the plug-ins on the <a href="/products/">products page</a>, or <a href="${HOMEBREW_URL}">install via Homebrew</a> with the cask commands shown there. For help, <a href="/contact/">get in touch</a>.</p>
      </div>
    </section>`
  });
}

function formatNoteParagraph(line) {
  return escapeHtml(line).replace(
    /&lt;a href=&quot;([^&"]+)&quot;&gt;(.*?)&lt;\/a&gt;/g,
    '<a href="$1">$2</a>'
  );
}

/* ---------- note figures ------------------------------------------------
   A note may attach a figure to one of its sections. There is one here, and
   it is not an illustration of the text: it is the text's argument, handed to
   the reader to try. The note says a single global oversampling switch has to
   be wrong for at least one stage; the figure lets someone pick that switch
   and watch which stages it is wrong for.

   The four stages and their rates are the ones the note names and the ones
   the plug-in ships. Nothing here is a guess: below its rate a stage aliases,
   above it the stage spends processor on margin it will never use, and at it
   the stage is what shipped.

   It renders in its shipped state -- every stage at its own rate -- so a
   visitor with no JavaScript reads the true picture and simply cannot move
   it. os-figure.js adds the moving part. */

const OVERSAMPLING_STAGES = Object.freeze([
  Object.freeze({ key: 'saturation', label: 'Saturation', rate: 4, detail: 'antiderivative anti-aliasing' }),
  Object.freeze({ key: 'soft-clip', label: 'Soft clipping', rate: 16, detail: 'widest harmonic spread' }),
  Object.freeze({ key: 'hard-clip', label: 'Hard clipping', rate: 8, detail: 'polyBLAMP transition correction' }),
  Object.freeze({ key: 'true-peak', label: 'True-peak detection', rate: 16, detail: '512 taps per phase' })
]);

const OVERSAMPLING_CHOICES = Object.freeze([1, 2, 4, 8, 16]);

function oversamplingFigure() {
  const dial = OVERSAMPLING_CHOICES.map(
    (factor) => `<button class="osfig-pick" type="button" data-os="${factor}" aria-pressed="false">${factor}&times;</button>`
  ).join('');

  const stages = OVERSAMPLING_STAGES.map(
    (stage) => `<li class="osfig-stage" data-stage="${stage.key}" data-rate="${stage.rate}" data-state="ok">
            <span class="osfig-k">${escapeHtml(stage.label)}</span>
            <span class="osfig-lane osfig-lane--${stage.rate}" aria-hidden="true"></span>
            <span class="osfig-rate">${stage.rate}&times;</span>
            <span class="osfig-verdict">as shipped</span>
            <span class="osfig-detail">${escapeHtml(stage.detail)}</span>
          </li>`
  ).join('');

  return `<figure class="osfig" aria-labelledby="osfig-title">
        <figcaption id="osfig-title" class="osfig-head">
          Most plug-ins offer one oversampling factor for everything inside. Choose one and see which
          stages it is wrong for, or take the per-stage answer the plug-in ships.
        </figcaption>
        <div class="osfig-dial" role="group" aria-label="Oversampling factor for the whole plug-in">
          ${dial}
          <button class="osfig-pick osfig-pick--shipped" type="button" data-os="stage" aria-pressed="true">Per stage</button>
        </div>
        <ol class="osfig-stages">${stages}</ol>
        <p class="osfig-summary" role="status">Every stage at the rate it needs &mdash; the one the plug-in ships.</p>
      </figure>`;
}

/* ---------- what EXPECTED TP is derived from ----------------------------
   The note's subject is a distinction, not a number: EXPECTED TP is
   calculated from the ceiling with a fixed 0.01 dB allowance, and it does not
   inspect the audio. A paragraph can say that. Two dials show it: move the
   ceiling and the readout moves with it; change the programme and nothing
   moves at all, because the programme was never in the sum.

   The allowance and the arithmetic are the plug-in's own. The programme
   choices carry no numbers, because none could be known from here -- which is
   the point the figure is making. */

const TP_CEILINGS = Object.freeze(['-3.0', '-2.0', '-1.0', '-0.5', '-0.1']);

const TP_PROGRAMME = Object.freeze([
  Object.freeze({ key: 'quiet', label: 'A quiet mix' }),
  Object.freeze({ key: 'loud', label: 'A loud master' }),
  Object.freeze({ key: 'limited', label: 'Heavily limited' })
]);

function expectedTpFigure() {
  const ceilings = TP_CEILINGS.map(
    (value) => `<button class="figdial-pick" type="button" data-ceiling="${value}" aria-pressed="${
      value === '-1.0' ? 'true' : 'false'
    }">${value}</button>`
  ).join('');

  const programme = TP_PROGRAMME.map(
    (item) => `<button class="figdial-pick" type="button" data-programme="${item.key}" aria-pressed="${
      item.key === 'quiet' ? 'true' : 'false'
    }">${escapeHtml(item.label)}</button>`
  ).join('');

  return `<figure class="tpfig" aria-labelledby="tpfig-title">
        <figcaption id="tpfig-title" class="osfig-head">
          EXPECTED TP is calculated from the ceiling with a fixed 0.01&nbsp;dB allowance. Move the ceiling
          and watch the readout follow it. Then change the programme, and watch it not.
        </figcaption>
        <div class="tpfig-dials">
          <div class="tpfig-dial">
            <span class="tpfig-legend">Ceiling &mdash; the setting you turn</span>
            <div class="figdial" role="group" aria-label="Ceiling">${ceilings}</div>
          </div>
          <div class="tpfig-dial">
            <span class="tpfig-legend">Programme &mdash; the audio passing through</span>
            <div class="figdial" role="group" aria-label="Programme">${programme}</div>
          </div>
        </div>
        <dl class="tpfig-sum">
          <div class="tpfig-row"><dt>Ceiling</dt><dd class="tpfig-ceiling">-1.0 dB</dd></div>
          <div class="tpfig-row"><dt>Fixed allowance</dt><dd>0.01 dB</dd></div>
          <div class="tpfig-row tpfig-row--out"><dt>EXPECTED TP</dt><dd class="tpfig-expected">-1.01 dB</dd></div>
          <div class="tpfig-row tpfig-row--unknown"><dt>True peak of your rendered file</dt><dd>not known from here</dd></div>
        </dl>
        <p class="osfig-summary" role="status">The readout is the ceiling, less the allowance. Nothing else is in the sum.</p>
      </figure>`;
}

/* ---------- what a reported latency makes the host do -------------------
   The note's claim is narrow: the number is about what the host has to move,
   not about what you hear. So the figure is the host. Suppose a plug-in on a
   parallel send reports n samples; every other track shifts by n to stay
   aligned. At zero, nothing shifts -- which is why the plug-in can sit on a
   send without the question arising.

   The sample counts on the dial are hypotheticals, offered as "suppose", and
   the figure says so. The only product number here is Tempo Delay's own, and
   it is the one the note states: zero. */

const LATENCY_CHOICES = Object.freeze([0, 64, 512, 2048]);

function latencyFigure() {
  const dial = LATENCY_CHOICES.map(
    (samples) => `<button class="figdial-pick" type="button" data-latency="${samples}" aria-pressed="${
      samples === 0 ? 'true' : 'false'
    }">${samples} samples</button>`
  ).join('');

  return `<figure class="latfig" aria-labelledby="latfig-title">
        <figcaption id="latfig-title" class="osfig-head">
          Suppose the plug-in on the send reports this many samples. The host delays every other track by
          the same amount so nothing drifts. Tempo Delay reports the first of them.
        </figcaption>
        <div class="figdial" role="group" aria-label="Reported latency">${dial}</div>
        <div class="latfig-tracks">
          <div class="latfig-track">
            <span class="latfig-name">Dry track</span>
            <span class="latfig-lane"><span class="latfig-block latfig-block--shifted"></span></span>
            <span class="latfig-shift">not moved</span>
          </div>
          <div class="latfig-track">
            <span class="latfig-name">Send &mdash; plug-in here</span>
            <span class="latfig-lane"><span class="latfig-block latfig-block--fixed"></span></span>
            <span class="latfig-shift">reports 0 samples</span>
          </div>
        </div>
        <p class="osfig-summary" role="status">At zero the host has nothing to compensate for, so nothing moves.</p>
      </figure>`;
}

/* Each figure names the one script that moves it, so a note ships the moving
   part it needs and nothing else. */
const NOTE_FIGURES = Object.freeze({
  'per-stage-oversampling': { render: oversamplingFigure, script: 'os-figure.js' },
  'expected-tp-derivation': { render: expectedTpFigure, script: 'tp-figure.js' },
  'reported-latency': { render: latencyFigure, script: 'latency-figure.js' }
});

function noteFigure(name) {
  if (!name) return '';
  const figure = NOTE_FIGURES[name];
  if (!figure) throw new Error(`Note figure "${name}" has no renderer`);
  return figure.render();
}

function noteFigureScripts(note) {
  const wanted = new Set(
    note.body
      .map((part) => part.figure)
      .filter(Boolean)
      .map((name) => {
        const figure = NOTE_FIGURES[name];
        if (!figure) throw new Error(`Note figure "${name}" has no renderer`);
        return figure.script;
      })
  );
  return [...wanted].map((file) => `<script src="/assets/${file}" defer></script>`).join('');
}

export function renderNote(slug) {
  const note = getNote(slug);
  const sections = note.body
    .map(
      (part, index) => `<section class="section" aria-labelledby="note-h-${index}">
      <div class="shell">
        <div class="section-head">
          <h2 id="note-h-${index}">${escapeHtml(part.h)}</h2>
        </div>
        ${part.p.map((line) => `<p class="lede">${formatNoteParagraph(line)}</p>`).join('')}
        ${noteFigure(part.figure)}
      </div>
    </section>`
    )
    .join('');

  return shell({
    title: `${note.title} — StudioZIO`,
    description: note.description,
    canonical: `${HUB_ORIGIN}/notes/${note.slug}/`,
    current: '',
    /* Each note carries its own share card rather than the site's. Twelve
       notes sharing one image meant a link to the true-peak note and a link
       to the AAX note arrived looking like the same thing; the card now says
       which note it is before anyone clicks. Generated from the heading, so
       there is no second copy of the title to keep in step -- see
       src/og/README.md. */
    /* Only the notes that carry a figure load its script, and only the one
       they carry: a note with no figure ships no extra byte. */
    scripts: noteFigureScripts(note),
    socialImage: `/assets/og/og-note-${note.slug}.png`,
    socialImageAlt: `${note.heading} — a StudioZIO technical note`,
    content: `<section class="hero tech-grid">
      <div class="shell">
        <div class="rise">
          <p class="eyebrow">Technical note</p>
          <h1>${escapeHtml(note.heading)}</h1>
          <p><a href="/notes/">All technical notes</a></p>
          <p class="lede">${escapeHtml(note.standfirst)}</p>
        </div>
      </div>
    </section>
    ${sections}`
  });
}

/* ---------- press kit ---------------------------------------------------
   Writers who decide to cover a free plug-in need four things in one place:
   a description they can quote without rewriting, the facts that are easy to
   get wrong, images they are allowed to use, and a name to contact. Sending
   them to a product page instead means the piece gets written from whatever
   the product page happens to say, including the parts that are marketing.
   Every figure here is read from the catalogue, so a version bump cannot
   leave a stale number on the one page the press reads. */

const pressJsonLd = () =>
  jsonLdBlock([
    organizationNode,
    {
      '@type': 'AboutPage',
      '@id': `${HUB_ORIGIN}/press/#page`,
      url: `${HUB_ORIGIN}/press/`,
      name: 'StudioZIO press kit',
      inLanguage: 'en',
      publisher: { '@id': ORGANIZATION_ID },
      about: { '@id': ORGANIZATION_ID }
    }
  ]);

const PRESS_ASSETS = Object.freeze([
  Object.freeze({
    href: '/assets/favicon.svg',
    label: 'StudioZIO mark',
    detail: 'SVG, scalable, cyan on near-black'
  }),
  Object.freeze({
    href: '/assets/media/mastering-suite-ui.webp',
    label: 'Mastering Suite interface',
    detail: 'WebP, shipping build at default settings'
  }),
  Object.freeze({
    href: '/assets/media/tempo-delay-ui.webp',
    label: 'Tempo Delay interface',
    detail: 'WebP, shipping build at default settings'
  }),
  Object.freeze({
    href: '/assets/og/og-studiozio.png',
    label: 'StudioZIO share card',
    detail: 'PNG, 1200 x 630'
  }),
  Object.freeze({
    href: '/assets/og/og-mixrack.png',
    label: 'MixRack share card',
    detail: 'PNG, 1200 x 630'
  })
]);

function pressAsset({ href, label, detail }) {
  return `<div><dt>${escapeHtml(label)}</dt><dd><a href="${escapeHtml(href)}">${escapeHtml(
    detail
  )}</a></dd></div>`;
}

export function renderPress() {
  const mastering = getProduct('mastering-suite');
  const tempo = getProduct('tempo-delay');
  const mixRack = getProduct('mixrack');

  return shell({
    title: 'Press kit and brand assets — StudioZIO',
    description:
      'Quotable descriptions, product facts, logo and interface images for StudioZIO Mastering Suite and Tempo Delay. Free to use in reviews and articles.',
    canonical: `${HUB_ORIGIN}/press/`,
    current: 'press',
    jsonLd: pressJsonLd(),
    content: `<section class="hero tech-grid">
      <div class="shell">
        <div class="rise">
          <p class="eyebrow">Press</p>
          <h1>Press kit</h1>
          <p class="lede">Everything needed to write about, review or feature StudioZIO plug-ins. The assets on this page may be used in reviews, roundups, videos and articles without asking first.</p>
          <p>Press enquiries: <a href="mailto:studiozioplugins@gmail.com">studiozioplugins@gmail.com</a>. For a bug or a support question, use the <a href="/contact/">contact form</a> instead.</p>
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="press-copy">
      <div class="shell">
        <div class="section-head">
          <p class="eyebrow">Descriptions</p>
          <h2 id="press-copy">Written to be quoted directly</h2>
        </div>
        <div class="panel module-card">
          <p class="eyebrow eyebrow--muted">One line</p>
          <p class="lede">StudioZIO makes free macOS audio plug-ins laid out in the order the audio takes, with the measurement always visible and no account or registration required.</p>
        </div>
        <div class="panel module-card mt-md">
          <p class="eyebrow eyebrow--muted">Fifty words</p>
          <p class="lede">StudioZIO is an independent one-person developer making free audio plug-ins for macOS. Mastering Suite puts nine mastering stages on a single surface in signal order, with the meter column always visible. Tempo Delay gives the left and right delay lines fully independent timing. Both are signed, notarised, and need no registration.</p>
        </div>
        <div class="panel module-card mt-md">
          <p class="eyebrow eyebrow--muted">One hundred words</p>
          <p class="lede">StudioZIO is an independent one-person developer making free audio plug-ins for macOS, built around the idea that measurement is not a separate product. StudioZIO Mastering Suite ${escapeHtml(
            mastering.version
          )} places nine mastering stages on one surface in the order the audio takes &mdash; mid/side, saturation, Pink Match, glue compression, maximizer, tone EQ, clipper, true-peak limiter and output &mdash; with loudness, true peak, crest factor and correlation visible throughout. StudioZIO Tempo Delay ${escapeHtml(
            tempo.version
          )} is a tempo-synced stereo delay whose two sides run fully independent buffers and note divisions. Both install from a signed, notarised package with no account, no iLok and no email registration.</p>
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="press-products">
      <div class="shell">
        <div class="section-head">
          <p class="eyebrow">Products</p>
          <h2 id="press-products">The catalogue, with the numbers</h2>
        </div>

        <h3>${escapeHtml(mastering.name)} ${escapeHtml(mastering.version)}</h3>
        <p class="lede">A nine-stage mastering console on a single surface. ${escapeHtml(
          mastering.architecture
        )}, macOS 11 or newer. ${escapeHtml(mastering.price)}.</p>
        <dl class="spec-grid mt-sm">
          <div><dt>Formats</dt><dd>${escapeHtml(formatList(mastering.formats))}</dd></div>
          <div><dt>Installer</dt><dd><code>${escapeHtml(mastering.filename)}</code></dd></div>
          <div><dt>SHA-256</dt><dd class="sha">${escapeHtml(mastering.sha256)}</dd></div>
          <div><dt>Product site</dt><dd><a href="${escapeHtml(
            MASTERING_SUITE_WEBSITE
          )}">studioziomasteringsuite.vercel.app</a></dd></div>
          <div><dt>KVR listing</dt><dd><a href="${escapeHtml(
            KVR_MASTERING_URL
          )}">kvraudio.com</a></dd></div>
          <div><dt>Release</dt><dd><a href="${escapeHtml(
            mastering.releaseUrl
          )}">Tag and checksum</a></dd></div>
        </dl>
        <p class="mt-sm">Worth mentioning: oversampling is fixed per stage rather than exposed as one global control, and EXPECTED TP is a ceiling-derived reference rather than a measurement of rendered output. Both are explained in the <a href="/notes/">technical notes</a>.</p>

        <h3 class="mt-lg">${escapeHtml(tempo.name)} ${escapeHtml(tempo.version)}</h3>
        <p class="lede">A tempo-synced stereo delay with independent left and right timing. ${escapeHtml(
          tempo.architecture
        )}, macOS 12 or newer. ${escapeHtml(tempo.price)}.</p>
        <dl class="spec-grid mt-sm">
          <div><dt>Formats</dt><dd>${escapeHtml(formatList(tempo.formats))}</dd></div>
          <div><dt>Parameters</dt><dd>32 automatable, stable identifiers</dd></div>
          <div><dt>Reported latency</dt><dd>0 samples</dd></div>
          <div><dt>Product site</dt><dd><a href="${escapeHtml(
            TEMPO_DELAY_WEBSITE
          )}">tempodelay.tech</a></dd></div>
          <div><dt>KVR listing</dt><dd><a href="${escapeHtml(
            KVR_TEMPO_URL
          )}">kvraudio.com</a></dd></div>
          <div><dt>Installers</dt><dd><a href="${escapeHtml(
            RELEASE_REPOSITORY_URL
          )}">Releases and checksums</a></dd></div>
        </dl>
        <p class="mt-sm">Worth mentioning: each side has its own buffer and its own note division, so the two channels can sit on different rhythmic values against one tempo.</p>

        <h3 class="mt-lg">${escapeHtml(mixRack.name)}</h3>
        <p class="lede">${escapeHtml(mixRack.description)} ${escapeHtml(
          mixRack.availability
        )} &mdash; no date and nothing to download. Listed for completeness rather than as an announcement; there is a <a href="${MIXRACK_WEBSITE}">product page</a>, with a two-minute look at the interface as it stands in development, and nothing more.</p>
      </div>
    </section>

    <section class="section" aria-labelledby="press-facts">
      <div class="shell">
        <div class="section-head">
          <p class="eyebrow">Accuracy</p>
          <h2 id="press-facts">Facts worth getting right</h2>
        </div>
        <dl class="spec-grid">
          <div><dt>Developer</dt><dd>One person, not a company. Credit: Mert Erkan.</dd></div>
          <div><dt>Price</dt><dd>Free permanently. Not a trial, not time-limited, not feature-locked, not a reduced version of a paid tier.</dd></div>
          <div><dt>Signing</dt><dd>Developer ID signed and Apple notarised, so there is no Gatekeeper warning.</dd></div>
          <div><dt>Registration</dt><dd>No account, no iLok and no email registration at any point.</dd></div>
          <div><dt>Platform</dt><dd>macOS only. No build exists for any other platform and none is planned.</dd></div>
          <div><dt>Architecture</dt><dd>Mastering Suite is Universal (Apple Silicon and Intel). Tempo Delay is Apple Silicon only.</dd></div>
          <div><dt>Pro Tools</dt><dd>Both plug-ins include AAX builds that are validated in Pro Tools. The history of this development path is available in <a href="/notes/where-aax-support-stands/">a technical note</a>.</dd></div>
        </dl>
      </div>
    </section>

    <section class="section" aria-labelledby="press-assets">
      <div class="shell">
        <div class="section-head">
          <p class="eyebrow">Assets</p>
          <h2 id="press-assets">Images</h2>
        </div>
        <p class="lede">Screenshots are of the shipping product at default settings, unretouched.</p>
        <dl class="spec-grid mt-sm">${PRESS_ASSETS.map(pressAsset).join('')}</dl>
        <p class="mt-md">Video: the <a href="https://youtu.be/K-OypjVpx-E">Mastering Suite overview</a> runs 1:05 and may be embedded. More on the <a href="https://www.youtube.com/@StudioZIO-plugins">StudioZIO channel</a>.</p>
        <p>Elsewhere: the <a href="https://www.kvraudio.com/developer/studiozio">KVR developer page</a> carries release notes and development posts, and <a href="${escapeHtml(
          INSTAGRAM_URL
        )}">Instagram</a> carries the shorter material.</p>
      </div>
    </section>`
  });
}

const COMMUNITY_NAVIGATION = [
  ['Community', '/community/', 'community'],
  ['Questions', '/community/questions/', 'questions'],
  ['Ideas', '/community/ideas/', 'ideas'],
  ['Compatibility Lab', '/community/compatibility/', 'compatibility'],
  ['Known Issues', '/community/known-issues/', 'known-issues'],
  ['Roadmap', '/community/roadmap/', 'roadmap']
];

function communityNav(currentSubpage) {
  return `<nav class="community-nav" aria-label="Community navigation">
    ${COMMUNITY_NAVIGATION.map(
      ([label, href, id]) =>
        `<a href="${href}"${id === currentSubpage ? ' aria-current="page"' : ''}>${escapeHtml(label)}</a>`
    ).join('')}
  </nav>`;
}

export function renderCommunity() {
  return shell({
    title: 'StudioZIO Community — Questions, Ideas & Status',
    description:
      'Questions, ideas, compatibility reports and public product status — connected to the StudioZIO development process.',
    canonical: `${HUB_ORIGIN}/community/`,
    current: 'community',
    content: `<section class="hero tech-grid">
      <div class="shell">
        <div class="rise">
          <p class="eyebrow">Community</p>
          <h1>StudioZIO Community</h1>
          <p class="lede">Questions, ideas, compatibility reports and public product status &mdash; connected to the StudioZIO development process.</p>
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="community-topics-title">
      <div class="shell">
        <div class="section-head">
          <p class="eyebrow">Community</p>
          <h2 id="community-topics-title">Questions, ideas and product status</h2>
        </div>
        <div class="card-grid card-grid--2">
          <a class="panel module-card" href="/community/questions/">
            <h3>Questions</h3>
            <p>Public questions and answers about using StudioZIO products.</p>
          </a>
          <a class="panel module-card" href="/community/ideas/">
            <h3>Ideas</h3>
            <p>A public place to share and discuss product ideas.</p>
          </a>
          <a class="panel module-card" href="/community/compatibility/">
            <h3>Compatibility Lab</h3>
            <p>Public compatibility information for hosts, macOS versions, formats and hardware.</p>
          </a>
          <a class="panel module-card" href="/community/known-issues/">
            <h3>Known Issues</h3>
            <p>Current public product-status information and documented limitations.</p>
          </a>
          <a class="panel module-card" href="/community/roadmap/">
            <h3>Roadmap</h3>
            <p>Public direction and status for StudioZIO products.</p>
          </a>
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="community-resources-title">
      <div class="shell">
        <div class="section-head">
          <p class="eyebrow">StudioZIO</p>
          <h2 id="community-resources-title">Existing resources</h2>
        </div>
        <dl class="spec-grid">
          <div>
            <dt><a href="/notes/">Technical Notes</a></dt>
            <dd>Existing explanations of StudioZIO measurement, design and platform behavior.</dd>
          </div>
          <div>
            <dt><a href="/contact/">Contact / Support</a></dt>
            <dd>Private support, bug reports, licensing/download matters and direct feature inquiries.</dd>
          </div>
          <div>
            <dt><a href="/products/">Products</a></dt>
            <dd>Current StudioZIO product catalog and authoritative product destinations.</dd>
          </div>
        </dl>
      </div>
    </section>`
  });
}

export function renderCommunityQuestions() {
  return shell({
    title: 'Where and how to ask — StudioZIO Community',
    description:
      'Bug reports and technical questions reach the person who writes the code. There are no support tickets, accounts or queues.',
    canonical: `${HUB_ORIGIN}/community/questions/`,
    current: 'community',
    content: `<section class="hero tech-grid">
      <div class="shell">
        <div class="rise">
          <p class="eyebrow">Community &middot; Support</p>
          <h1>Where and how to ask</h1>
          <p class="lede">Bug reports and technical questions reach the person who writes the code. There are no support tickets, accounts or queues.</p>
          ${communityNav('questions')}
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="channels-title">
      <div class="shell">
        <div class="section-head">
          <h2 id="channels-title">Choosing the right channel</h2>
        </div>
        <p>Public technical questions and bug reports belong on the official StudioZIO Support issue tracker on GitHub.</p>
        <p class="mt-sm">If your matter involves private details, sensitive project information or a direct inquiry, use the StudioZIO contact form.</p>
        <div class="hero-actions mt-md">
          <a class="btn btn-primary" href="https://github.com/StudioZIO/Support/issues/new?template=question.md">Open a public issue</a>
          <a class="btn" href="/contact/">Contact privately</a>
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="actionable-title">
      <div class="shell">
        <div class="section-head">
          <h2 id="actionable-title">What makes a report actionable</h2>
        </div>
        <ul class="actionable-list">
          <li>Plug-in and version</li>
          <li>Host DAW and exact version</li>
          <li>macOS version and Mac model</li>
          <li>Apple Silicon or Intel where relevant</li>
          <li>Plug-in format: AU, VST3, AAX or Standalone</li>
          <li>Shortest sequence that reproduces the issue</li>
          <li>Crash report from Console.app if a crash occurred</li>
        </ul>
      </div>
    </section>

    <section class="section" aria-labelledby="discovery-title">
      <div class="shell">
        <div class="section-head">
          <h2 id="discovery-title">Before reporting that a plug-in does not appear</h2>
        </div>
        <pre class="code-block"><code>auval -a | grep -i studiozio</code></pre>
        <pre class="code-block"><code>killall -9 AudioComponentRegistrar</code></pre>
        <p class="mono-note mt-md">Tempo Delay is Apple Silicon only and will not appear on an Intel Mac.</p>
      </div>
    </section>`
  });
}

export function renderCommunityIdeas() {
  return shell({
    title: 'Share an idea — StudioZIO Community',
    description:
      'StudioZIO accepts feature requests and workflow observations through the public Support tracker on GitHub.',
    canonical: `${HUB_ORIGIN}/community/ideas/`,
    current: 'community',
    content: `<section class="hero tech-grid">
      <div class="shell">
        <div class="rise">
          <p class="eyebrow">Community &middot; Product Feedback</p>
          <h1>Share an idea</h1>
          <p class="lede">StudioZIO accepts feature requests and workflow observations through the public Support tracker.</p>
          ${communityNav('ideas')}
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="useful-request-title">
      <div class="shell">
        <div class="section-head">
          <h2 id="useful-request-title">What makes a useful request</h2>
        </div>
        <p>Describe the musical or technical problem you are trying to solve rather than prescribing a particular control.</p>
        <p class="mt-sm">The underlying problem may have a signal-flow or architectural solution that the proposed control does not anticipate.</p>
      </div>
    </section>

    <section class="section" aria-labelledby="what-next-title">
      <div class="shell">
        <div class="section-head">
          <h2 id="what-next-title">What happens next</h2>
        </div>
        <p>Feature requests are reviewed through the public Support tracker.</p>
        <p class="mt-sm">Submission does not guarantee implementation or a delivery date.</p>
        <p class="mt-sm">StudioZIO does not operate a public voting queue.</p>
        <p class="mt-sm">Crashes and incorrect audio-processing behavior take priority over workflow enhancements.</p>
        <div class="hero-actions mt-md">
          <a class="btn btn-primary" href="https://github.com/StudioZIO/Support/issues/new?template=feature_request.md">Share an idea on GitHub</a>
          <a class="btn" href="/contact/">Submit private feedback</a>
        </div>
      </div>
    </section>`
  });
}

export function renderCommunityCompatibility() {
  const mastering = getProduct('mastering-suite');
  const tempo = getProduct('tempo-delay');

  return shell({
    title: 'Compatibility Lab — StudioZIO Community',
    description:
      'Verified platform, format and host information for current StudioZIO products on macOS.',
    canonical: `${HUB_ORIGIN}/community/compatibility/`,
    current: 'community',
    content: `<section class="hero tech-grid">
      <div class="shell">
        <div class="rise">
          <p class="eyebrow">Community &middot; System Verification</p>
          <h1>Compatibility Lab</h1>
          <p class="lede">Verified platform, format and host information for current StudioZIO products.</p>
          ${communityNav('compatibility')}
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="specs-title">
      <div class="shell">
        <div class="section-head">
          <h2 id="specs-title">Current product specifications</h2>
        </div>
        <div class="card-grid card-grid--2">
          <article class="panel product-spec-card">
            <div class="product-spec-head">
              <h3>Mastering Suite</h3>
              <span class="chip">v${mastering.version}</span>
            </div>
            <dl class="spec-grid">
              <div>
                <dt>Minimum OS</dt>
                <dd>macOS 11+</dd>
              </div>
              <div>
                <dt>Architecture</dt>
                <dd>Universal — Apple Silicon and Intel</dd>
              </div>
              <div>
                <dt>Formats</dt>
                <dd>AUv2 &middot; VST3 &middot; AAX &middot; Standalone</dd>
              </div>
              <div class="spec-full">
                <dt>AAX / Pro Tools</dt>
                <dd>AAX validated in Pro Tools</dd>
              </div>
            </dl>
          </article>
          <article class="panel product-spec-card">
            <div class="product-spec-head">
              <h3>Tempo Delay</h3>
              <span class="chip">v${tempo.version}</span>
            </div>
            <dl class="spec-grid spec-grid--tempo-delay">
              <div>
                <dt>Minimum OS</dt>
                <dd>macOS 12+</dd>
              </div>
              <div>
                <dt>Architecture</dt>
                <dd>Apple Silicon (arm64) only</dd>
              </div>
              <div>
                <dt>Formats</dt>
                <dd>AUv2 &middot; VST3 &middot; AAX &middot; Standalone</dd>
              </div>
              <div>
                <dt>Reported processing latency</dt>
                <dd>0 samples</dd>
              </div>
              <div class="spec-full">
                <dt>AAX / Pro Tools</dt>
                <dd>AAX validated in Pro Tools</dd>
              </div>
            </dl>
          </article>
          <article class="panel product-spec-card">
            <div class="product-spec-head">
              <h3>MixRack</h3>
              <span class="chip">In development</span>
            </div>
            <dl class="spec-grid">
              <div>
                <dt>Status</dt>
                <dd>In development</dd>
              </div>
              <div>
                <dt>Platform</dt>
                <dd>macOS</dd>
              </div>
              <div>
                <dt>Planned formats</dt>
                <dd>AU &middot; VST3 &middot; Standalone</dd>
              </div>
              <div class="spec-full">
                <dt>Compatibility matrix</dt>
                <dd>Not yet published</dd>
              </div>
            </dl>
          </article>
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="hosts-title">
      <div class="shell">
        <div class="section-head">
          <h2 id="hosts-title">Host verification</h2>
        </div>
        <p>StudioZIO distinguishes between configurations with direct test evidence and hosts that have not yet received formal verification.</p>
        <div class="card-grid card-grid--2 mt-md">
          <article class="panel host-card">
            <div class="host-card-head">
              <h3>REAPER</h3>
              ${chip('StudioZIO Verified', 'flag')}
            </div>
            <p>AU and VST3 host testing exists for current StudioZIO products.</p>
          </article>
          <article class="panel host-card">
            <div class="host-card-head">
              <h3>Logic Pro</h3>
              ${chip('StudioZIO Verified', 'flag')}
            </div>
            <p>AU validation and host smoke testing exist.</p>
          </article>
          <article class="panel host-card">
            <div class="host-card-head">
              <h3>Pro Tools</h3>
              ${chip('StudioZIO Verified', 'flag')}
            </div>
            <p>AAX formats are validated in Pro Tools.</p>
          </article>
          <article class="panel host-card">
            <div class="host-card-head">
              <h3>Ableton Live</h3>
              ${chip('Not yet StudioZIO verified')}
            </div>
          </article>
          <article class="panel host-card">
            <div class="host-card-head">
              <h3>Cubase</h3>
              ${chip('Not yet StudioZIO verified')}
            </div>
          </article>
          <article class="panel host-card">
            <div class="host-card-head">
              <h3>Studio One</h3>
              ${chip('Not yet StudioZIO verified')}
            </div>
          </article>
          <article class="panel host-card">
            <div class="host-card-head">
              <h3>FL Studio</h3>
              ${chip('Not yet StudioZIO verified')}
            </div>
          </article>
          <article class="panel host-card">
            <div class="host-card-head">
              <h3>Bitwig</h3>
              ${chip('Not yet StudioZIO verified')}
            </div>
          </article>
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="community-verification-title">
      <div class="shell">
        <div class="section-head">
          <h2 id="community-verification-title">Community verification</h2>
        </div>
        <p>Independent host reports can help expand the compatibility record without being presented as StudioZIO laboratory verification.</p>
        <div class="hero-actions mt-md">
          <a class="btn btn-primary" href="https://github.com/StudioZIO/Support/issues/new?template=independent-use-feedback.md">Submit host feedback</a>
        </div>
      </div>
    </section>`
  });
}

export function renderCommunityKnownIssues() {
  return shell({
    title: 'Known issues and platform limits — StudioZIO Community',
    description:
      'Documented platform boundaries and host-specific behavior for current StudioZIO releases.',
    canonical: `${HUB_ORIGIN}/community/known-issues/`,
    current: 'community',
    content: `<section class="hero tech-grid">
      <div class="shell">
        <div class="rise">
          <p class="eyebrow">Community &middot; Transparency</p>
          <h1>Known issues and platform limits</h1>
          <p class="lede">Documented platform boundaries and host-specific behavior for current StudioZIO releases.</p>
          ${communityNav('known-issues')}
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="defect-status-title">
      <div class="shell">
        <div class="section-head">
          <h2 id="defect-status-title">Published defect status</h2>
        </div>
        <p>One active host-specific UI defect is currently known in Logic Pro: vertical plug-in resizing can oscillate up and down instead of settling cleanly.</p>
        <p class="mt-sm">One defect is closed: the Mastering Suite installer published on 10 September 2026 installed nothing, and was replaced on 11 September 2026.</p>
        <p class="mt-sm">Other current entries on this page are platform limits or host-specific behaviors rather than open defects.</p>
      </div>
    </section>

    <section class="section" aria-labelledby="known-limits-title">
      <div class="shell">
        <div class="section-head">
          <h2 id="known-limits-title">Known limits and active defects</h2>
        </div>
        <div class="card-grid">
          <article class="panel issue-card">
            <div class="issue-card-head">
              <h3>Logic Pro vertical resize oscillation</h3>
              <div class="chip-row">
                ${chip('Active Defect', 'destructive')}
                <span class="chip chip--destructive">Open</span>
              </div>
            </div>
            <p>In Logic Pro, vertical plug-in resizing can sometimes oscillate up and down rather than settling cleanly at the requested height.</p>
            <div class="issue-workaround">
              <span class="issue-label">Workaround</span>
              <p>Not yet publicly established.</p>
            </div>
          </article>

          <article class="panel issue-card">
            <div class="issue-card-head">
              <h3>Mastering Suite installer published 10 September 2026 installed nothing</h3>
              <div class="chip-row">
                ${chip('Defect — Closed', 'closed')}
                <span class="chip chip--bare">Reported 10 September 2026</span>
                <span class="chip chip--bare">Fixed 11 September 2026</span>
              </div>
            </div>
            <p>The Mastering Suite 2.1.1 installer published on 10 September 2026 &mdash; the release that added the AAX format &mdash; installed only its AAX component. Inside that package the Audio Unit, VST3 and Standalone payloads were stored as folders rather than archives, so the macOS Installer had nothing to unpack and skipped all three while still showing its success screen. Running it repeatedly changed nothing, and it wrote nothing to the system that needed cleaning up afterwards.</p>
            <p class="mt-sm">The plug-in code was never affected. The packaging was corrected and republished the next day as <a class="accent-text" href="${RELEASE_REPOSITORY_URL}/releases/tag/mastering-suite-v2.1.1-install-fix-2026.09.11">mastering-suite-v2.1.1-install-fix-2026.09.11</a>, same version, signed and notarized, with all four formats installing. The 10 September release remains published as historical evidence and should not be installed.</p>
            <div class="issue-workaround">
              <span class="issue-label">Resolution</span>
              <p>Download the current installer again from the <a class="accent-text" href="${MASTERING_SUITE_WEBSITE}">Mastering Suite site</a>. Nothing needs uninstalling first.</p>
            </div>
          </article>


          <article class="panel issue-card">
            <div class="issue-card-head">
              <h3>Architecture support</h3>
              <div class="chip-row">
                ${chip('Unsupported Configuration')}
              </div>
            </div>
            <p>Mastering Suite is Universal for Apple Silicon and Intel. Tempo Delay is built for arm64 Apple Silicon Macs only.</p>
            <div class="issue-workaround">
              <span class="issue-label">Workaround</span>
              <p>Mastering Suite runs on Intel Macs; its build is Universal. Tempo Delay does not, and there is no Intel build of it.</p>
            </div>
          </article>

          <article class="panel issue-card">
            <div class="issue-card-head">
              <h3>macOS-only platform support</h3>
              <div class="chip-row">
                ${chip('Unsupported Configuration')}
              </div>
            </div>
            <p>Current StudioZIO software targets macOS. No Windows or Linux builds are currently planned.</p>
          </article>

          <article class="panel issue-card">
            <div class="issue-card-head">
              <h3>Logic Pro transport-stop delay tails</h3>
              <div class="chip-row">
                ${chip('Host-Specific Behavior')}
              </div>
            </div>
            <p>When playback stops on some direct-track insert scenarios with short source regions, Logic Pro may stop processing the plug-in, interrupting long Tempo Delay tails.</p>
            <div class="issue-workaround">
              <span class="issue-label">Workaround</span>
              <p>Use Tempo Delay on an Aux/Bus return with 100% Wet when uninterrupted post-transport delay tails are required.</p>
            </div>
          </article>
        </div>
        <div class="hero-actions mt-lg">
          <a class="btn btn-primary" href="https://github.com/StudioZIO/Support/issues/new?template=bug_report.md">Report an undocumented issue</a>
        </div>
      </div>
    </section>`
  });
}

export function renderCommunityRoadmap() {
  return shell({
    title: 'Public roadmap — StudioZIO Community',
    description:
      'Public status for released software and work that has already been announced at StudioZIO.',
    canonical: `${HUB_ORIGIN}/community/roadmap/`,
    current: 'community',
    content: `<section class="hero tech-grid">
      <div class="shell">
        <div class="rise">
          <p class="eyebrow">Community &middot; Product Direction</p>
          <h1>Public roadmap</h1>
          <p class="lede">Public status for released software and work that has already been announced.</p>
          ${communityNav('roadmap')}
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="shipped-title">
      <div class="shell">
        <div class="section-head">
          <h2 id="shipped-title">Shipped</h2>
        </div>
        <div class="card-grid card-grid--2">
          <article class="panel roadmap-card">
            <div class="roadmap-card-head">
              <h3>StudioZIO Mastering Suite 2.1.1</h3>
              ${chip('Shipped')}
            </div>
            <p>Current production release. Universal macOS binary (Apple Silicon and Intel). AUv2, VST3, AAX and Standalone.</p>
          </article>
          <article class="panel roadmap-card">
            <div class="roadmap-card-head">
              <h3>StudioZIO Tempo Delay 4.0.1</h3>
              ${chip('Shipped')}
            </div>
            <p>Current production release for Apple Silicon Macs running macOS 12+. AUv2, VST3, AAX and Standalone.</p>
          </article>
          <article class="panel roadmap-card">
            <div class="roadmap-card-head">
              <h3>AAX release</h3>
              ${chip('Shipped')}
            </div>
            <p>AAX formats are now publicly available and validated in Pro Tools.</p>
          </article>
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="development-title">
      <div class="shell">
        <div class="section-head">
          <h2 id="development-title">In development</h2>
        </div>
        <div class="card-grid card-grid--2">
          <article class="panel roadmap-card">
            <div class="roadmap-card-head">
              <h3>StudioZIO MixRack</h3>
              ${chip('In Development')}
            </div>
            <p>A new StudioZIO mixing environment currently in development for macOS. AU, VST3, AAX and Standalone formats are planned. No release date has been announced.</p>
          </article>
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="scope-title">
      <div class="shell">
        <div class="section-head">
          <h2 id="scope-title">Current platform scope</h2>
        </div>
        <p>Current StudioZIO releases target macOS.</p>
        <p class="mt-sm">Tempo Delay is Apple Silicon only.</p>
        <p class="mt-sm">Windows and Linux builds are not currently planned.</p>
        <div class="hero-actions mt-md">
          <a class="btn btn-primary" href="https://github.com/StudioZIO/StudioZIO-Releases">Track releases on GitHub</a>
        </div>
      </div>
    </section>`
  });
}
