import {
  getProduct,
  products,
  MASTERING_SUITE_WEBSITE,
  TEMPO_DELAY_WEBSITE
} from './catalog.mjs';
import { mediaSeconds } from './media.mjs';

const stylesheet = '/assets/styles.css';
export const HUB_ORIGIN = 'https://studiozio.vercel.app';

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
  <script src="/assets/events.js" defer></script>`;

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
const ZIO_ARTIST_WEBSITE = 'https://zio-audio.vercel.app/';

function zioFooterLink() {
  return `<li><a href="${ZIO_ARTIST_WEBSITE}">ZIO — music</a></li>`;
}

const NAVIGATION = [
  ['Hub', '/', 'hub'],
  ['Mastering Suite', MASTERING_SUITE_WEBSITE, 'mastering'],
  ['Tempo Delay', TEMPO_DELAY_WEBSITE, 'tempo'],
  ['Contact', '/contact/', 'contact']
];

function navList(current) {
  return NAVIGATION.map(
    ([label, href, id]) =>
      `<li><a href="${escapeHtml(href)}"${
        current === id ? ' aria-current="page"' : ''
      }>${escapeHtml(label)}</a></li>`
  ).join('');
}

function chip(label, tone = '') {
  return `<span class="chip${tone ? ` chip--${tone}` : ''}">${
    tone === 'flag' ? '<span class="dot" aria-hidden="true"></span>' : ''
  }${escapeHtml(label)}</span>`;
}

const DEFAULT_SOCIAL_IMAGE = '/assets/og/og-studiozio.png';

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
    'Independent audio software company building native Audio Unit, VST3 and Standalone plug-ins for macOS.',
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
        <ul>${navList(current)}</ul>
      </nav>
      <details class="nav-compact">
        <summary aria-label="Menu" aria-controls="compact-menu"><span class="open" aria-hidden="true">≡</span><span class="shut" aria-hidden="true">×</span></summary>
        <nav class="panel" id="compact-menu" aria-label="Primary">
          <ul>${navList(current)}</ul>
        </nav>
      </details>
    </div>
  </header>
  <main id="main-content">${content}</main>
  <footer class="site-footer">
    <div class="shell inner">
      ${logo()}
      <nav aria-label="Footer">
        <ul>${navList('')}${zioFooterLink()}</ul>
      </nav>
      <p class="copy">© 2026 StudioZIO</p>
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
        <span class="chip-row">${chip('AU · VST3')}${chip('Notarized', 'flag')}</span>
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
        <span class="chip-row">${chip('AU · VST3')}${chip('Host sync', 'flag')}</span>
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
      'StudioZIO Mastering Suite and StudioZIO Tempo Delay for macOS in AU and VST3, plus the upcoming ZIO MixRack.',
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
            <p class="lede">Two focused instruments, one interface language. Everything you touch moves, meters and reports the value it is actually applying.</p>
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
          <p class="lede">Every product ships as a signed macOS installer with its formats and status stated up front.</p>
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

export function renderMixRack() {
  const product = getProduct('mixrack');
  return shell({
    title: 'ZIO MixRack — Coming Soon | StudioZIO',
    description:
      'ZIO MixRack is a modular mixing environment for macOS, coming soon from StudioZIO in AU, VST3, and Standalone formats.',
    canonical: `${HUB_ORIGIN}/products/mixrack/`,
    current: 'hub',
    scripts: '<script src="/assets/notify.js" defer></script>',
    content: `<section class="hero tech-grid">
      <div class="shell">
        <div class="rise">
          <p class="eyebrow">StudioZIO software · Coming Soon</p>
          <h1>ZIO MixRack</h1>
          <p class="lede">${escapeHtml(product.description)} Build a signal chain from StudioZIO processing modules and shape a mix from one unified interface.</p>
          <div class="chip-row mt-lg">
            ${chip(product.manufacturer)}${chip(product.platform)}${chip('Coming Soon', 'flag')}
          </div>
        </div>
      </div>
    </section>
    <section class="section" aria-labelledby="mixrack-spec-title">
      <div class="shell">
        <div class="section-head">
          <p class="eyebrow">Planned formats</p>
          <h2 id="mixrack-spec-title">Coming Soon</h2>
          <p class="lede">ZIO MixRack is in development. Release details will be published when they are available.</p>
        </div>
        <dl class="spec-grid">
          <div><dt>Manufacturer</dt><dd>${escapeHtml(product.manufacturer)}</dd></div>
          <div><dt>Platform</dt><dd>${escapeHtml(product.platform)}</dd></div>
          <div><dt>Status</dt><dd>Coming Soon</dd></div>
          <div><dt>Formats</dt><dd>${formatList(product.formats)}</dd></div>
        </dl>
      </div>
    </section>
    <section class="section" aria-labelledby="mixrack-notify-title">
      <div class="shell">
        <div class="section-head">
          <p class="eyebrow">Release notice</p>
          <h2 id="mixrack-notify-title">Hear about it once</h2>
          <p class="lede">ZIO MixRack has no release date yet. Leave an address and it gets used exactly once — on the day it ships.</p>
        </div>
        <form class="panel-float notify-form" novalidate="false">
          <div class="form-hp" aria-hidden="true">
            <label for="notify-company">Company</label>
            <input id="notify-company" name="company" type="text" tabindex="-1" autocomplete="off">
          </div>

          <div class="form-row">
            <label class="form-label" for="notify-email">Email <span class="req">required</span></label>
            <input id="notify-email" name="email" class="field" type="email" required autocomplete="email">
            <p class="form-hint">One message, when ZIO MixRack is released. Nothing else is sent to it, and it is not used for anything else.</p>
          </div>

          <p class="form-status" role="status" aria-live="polite"></p>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Notify me at release</button>
          </div>
        </form>

        <noscript>
          <p class="form-note">This form needs JavaScript to send. With it switched off nothing is submitted, so please enable it for this page rather than assuming an address was recorded.</p>
        </noscript>
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
        <p class="eyebrow">Support</p>
        <h1>Talk to the people who build it</h1>
        <p class="lede">Bug reports, host compatibility and setup questions all reach the same desk. Most answers go out within 24&ndash;48 business hours.</p>
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
