import {
  getProduct,
  products,
  MASTERING_SUITE_WEBSITE,
  TEMPO_DELAY_WEBSITE
} from './catalog.mjs';

const stylesheet = '/assets/styles.css';
const HUB_ORIGIN = 'https://studiozio.vercel.app';

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
  const open = link
    ? `<a class="logo" href="${escapeHtml(href)}" aria-label="StudioZIO home">`
    : '<span class="logo">';
  const close = link ? '</a>' : '</span>';
  return `${open}
      <span class="logo-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M2 12h3l2.6-7.2L11 19l3-9 2.4 4.4H22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
      <span class="logo-word">Studio<b>ZIO</b></span>
      ${suffix ? `<span class="logo-suffix">${escapeHtml(suffix)}</span>` : ''}
    ${close}`;
}

const NAVIGATION = [
  ['Hub', '/', 'hub'],
  ['Mastering Suite', MASTERING_SUITE_WEBSITE, 'mastering'],
  ['Tempo Delay', TEMPO_DELAY_WEBSITE, 'tempo'],
  ['System', '/system/', 'system']
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
    tone === 'signal' ? '<span class="dot" aria-hidden="true"></span>' : ''
  }${escapeHtml(label)}</span>`;
}

function shell({ title, description, canonical, current, content }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#0b1013">
  <meta name="description" content="${escapeHtml(description)}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="StudioZIO">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  ${canonical ? `<meta property="og:url" content="${escapeHtml(canonical)}">
  <link rel="canonical" href="${escapeHtml(canonical)}">` : ''}
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <title>${escapeHtml(title)}</title>
  <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="${stylesheet}">
  <link rel="preload" href="/assets/fonts/space-grotesk-700.woff2" as="font" type="font/woff2" crossorigin>
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
        <ul>${navList('')}</ul>
      </nav>
      <p class="copy">© 2026 StudioZIO</p>
    </div>
  </footer>
</body>
</html>`;
}

/* ---------- live plugin mocks ------------------------------------------
   Flat and alive: breathing curve, drifting meters, knobs whose indicator
   rotates on hover. Stroke weights carry the boldness — no blur, no glow.
   Marked decorative: every load-bearing fact is stated in the card body. */

function masteringSuiteMock() {
  const knobs = [
    ['Low cut', '24 Hz', 'primary'],
    ['Glue', '-16.0 dB', 'signal'],
    ['M/S width', '124 %', 'primary'],
    ['Match', '75 %', 'primary'],
    ['Ceiling', '-0.2 dB', 'signal']
  ];
  const knobSvg = (tone) => `<svg viewBox="0 0 46 46" fill="none" aria-hidden="true">
          <circle cx="23" cy="23" r="17" stroke="var(--surface-control)" stroke-width="4"/>
          <path d="M11.4 34.6A17 17 0 0 1 23 6" stroke="var(--${tone})" stroke-width="3" stroke-linecap="round"/>
          <line class="ind" x1="23" y1="23" x2="23" y2="9" stroke="var(--foreground)" stroke-width="2" stroke-linecap="round"/>
        </svg>`;

  return `<div class="mock" aria-hidden="true">
      <div class="mock-head">
        <span class="mock-title"><span class="dot"></span>Mastering Suite</span>
        <span class="chip-row">${chip('AU · VST3')}${chip('Notarized', 'signal')}</span>
      </div>
      <div class="mock-body">
        <div class="mock-eq">
          <svg viewBox="0 0 420 150" role="presentation" class="mock-eq-curve">
            <path d="M0 100h420M0 60h420" stroke="var(--hairline)" stroke-width="1"/>
            <path d="M8 108C70 108 96 62 150 62s70 34 128 20 106-52 134-52" stroke="var(--primary)" stroke-width="2.5" fill="none" stroke-linecap="round"/>
            <path d="M8 62C120 74 250 96 412 112" stroke="var(--signal)" stroke-width="1.5" stroke-dasharray="5 6" fill="none" opacity="0.75"/>
            <circle cx="150" cy="62" r="4.5" fill="var(--background)" stroke="var(--primary)" stroke-width="2.5"/>
            <circle cx="278" cy="82" r="4.5" fill="var(--background)" stroke="var(--signal)" stroke-width="2.5"/>
            <text x="12" y="140" fill="var(--muted-foreground)" font-family="var(--font-mono)" font-size="10" letter-spacing="1.6">LOW</text>
            <text x="176" y="140" fill="var(--muted-foreground)" font-family="var(--font-mono)" font-size="10" letter-spacing="1.6">MID GLUE</text>
            <text x="344" y="140" fill="var(--muted-foreground)" font-family="var(--font-mono)" font-size="10" letter-spacing="1.6">AIR</text>
          </svg>
          <div class="meter-stack"><span class="meter"></span><span class="meter"></span><span class="meter"></span><span class="meter"></span></div>
        </div>
        <div class="mock-knobs">
          ${knobs
            .map(
              ([label, value, tone]) => `<span class="knob">
            ${knobSvg(tone)}
            <span class="k">${escapeHtml(label)}</span>
            <span class="v">${escapeHtml(value)}</span>
          </span>`
            )
            .join('')}
        </div>
      </div>
    </div>`;
}

function tempoDelayMock() {
  const readouts = [
    ['L div', '1/4', ''],
    ['R div', '1/8D', 'signal'],
    ['Feedback', '38 %', ''],
    ['Ping-pong', 'On', 'plain']
  ];
  return `<div class="mock" aria-hidden="true">
      <div class="mock-head">
        <span class="mock-title"><span class="dot"></span>Tempo Delay</span>
        <span class="chip-row">${chip('AU · VST3')}${chip('Host sync', 'signal')}</span>
      </div>
      <div class="mock-body">
        <div class="mock-readouts">
          ${readouts
            .map(
              ([k, v, tone]) => `<span class="readout">
            <span class="k">${escapeHtml(k)}</span>
            <span class="v${tone ? ` v--${tone}` : ''}">${escapeHtml(v)}</span>
          </span>`
            )
            .join('')}
        </div>
        <div class="lane">
          <span class="lane-head"><span>Signal routing</span><span>Ping-pong</span></span>
          <span class="lane-row"><span class="ch">L</span><span class="lane-track"><span class="lane-tap lane-tap--p38"></span><span class="lane-tap lane-tap--p76"></span></span></span>
          <span class="lane-row lane-row--r"><span class="ch">R</span><span class="lane-track"><span class="lane-tap lane-tap--p19"></span><span class="lane-tap lane-tap--p57"></span></span></span>
          <span class="lane-foot"><span>Independent left and right timing</span><span>tap 2</span></span>
        </div>
      </div>
    </div>`;
}

const MOCKS = {
  'mastering-suite': masteringSuiteMock,
  'tempo-delay': tempoDelayMock
};

/* ---------- cards ------------------------------------------------------- */

function productCard(product) {
  const isUpcoming = product.availability === 'Coming soon';
  const mock = MOCKS[product.slug];
  const detailsLabel = product.externalDetails ? 'Open product site' : 'Open product page';
  const chips = [
    product.version ? chip(`v${product.version}`) : '',
    chip(product.compactFormats.replaceAll(' / ', ' · ')),
    isUpcoming ? chip(product.availability, 'signal') : chip(product.availability)
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

function downloadComponent(product) {
  return `<section class="section" aria-labelledby="download-title">
      <div class="shell">
        <div class="panel-float download-row">
          <div>
            <p class="eyebrow">Official macOS installer</p>
            <h2 id="download-title">${escapeHtml(product.shortName)} ${escapeHtml(product.version)}</h2>
            <p class="lede">Version ${escapeHtml(product.version)} · ${formatList(product.formats)}</p>
            <div class="chip-row mt-sm">
              ${chip(product.signing)}${chip(product.notarization, 'signal')}
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
    content: `<section class="hero tech-grid">
      <div class="shell">
        <div class="hero-grid hero--stacked">
          <div class="rise">
            <p class="eyebrow">Plug-ins for macOS</p>
            <h1>Tools that behave like<span class="accent">hardware you trust.</span></h1>
            <p class="lede">Two focused instruments, one interface language. Everything you touch moves, meters and reports the value it is actually applying.</p>
            <div class="hero-actions">
              <a class="btn btn-primary" href="${escapeHtml(MASTERING_SUITE_WEBSITE)}">Mastering Suite</a>
              <a class="btn" href="${escapeHtml(TEMPO_DELAY_WEBSITE)}">Tempo Delay</a>
              <span class="chip chip--bare chip--signal"><span class="dot" aria-hidden="true"></span>Notarized builds</span>
            </div>
          </div>
        </div>
      </div>
    </section>
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
    <section class="section" aria-labelledby="approach-title">
      <div class="shell">
        <div class="section-head">
          <p class="eyebrow">Approach</p>
          <h2 id="approach-title">Why they look the same</h2>
        </div>
        <div class="card-grid card-grid--3">
          <article class="panel module-card"><span class="idx">01</span><h3>One lockup</h3><p>A single waveform mark and wordmark across every property. The product name is a mono label, never a second logo.</p></article>
          <article class="panel module-card"><span class="idx">02</span><h3>A visible surface ramp</h3><p>Base, raised, overlay and control each step up in lightness and carry a hairline plus a real shadow, so panels read as objects.</p></article>
          <article class="panel module-card"><span class="idx">03</span><h3>Motion that means something</h3><p>Meters move because there is signal, knobs rotate to their value, taps travel the routing lane. Nothing animates for decoration.</p></article>
        </div>
        <p class="mt-xl"><a class="btn" href="/system/">Read the design system</a></p>
      </div>
    </section>`
  });
}

export function renderProducts() {
  return shell({
    title: 'Products — StudioZIO',
    description:
      'Browse StudioZIO Mastering Suite and Tempo Delay, available now, plus ZIO MixRack, coming soon.',
    canonical: `${HUB_ORIGIN}/products/`,
    current: 'hub',
    content: `<section class="hero tech-grid">
      <div class="shell">
        <p class="eyebrow">StudioZIO catalog</p>
        <h1>Products</h1>
        <p class="lede">Available and upcoming StudioZIO software, with product status and verified public links.</p>
      </div>
    </section>
    <section class="section" aria-labelledby="catalog-list-title">
      <div class="shell">
        <div class="section-head">
          <p class="eyebrow">Catalog</p>
          <h2 id="catalog-list-title">Every StudioZIO product</h2>
        </div>
        <div class="card-grid card-grid--2">${products.map(productCard).join('')}</div>
      </div>
    </section>`
  });
}

export function renderMasteringSuite() {
  const product = getProduct('mastering-suite');
  const modules = [
    ['Tone EQ', 'Broad shaping bands with a curve that reads at a glance and never redraws behind the header.'],
    ['Glue compression', 'Program-dependent release with a gain-reduction trace, so you can see how much the bus is moving.'],
    ['Mid/side width', 'Stereo width with a correlation read-out that flags anything that will collapse in mono.'],
    ['Saturation', 'Drive staged before the ceiling, applied where the level is still under your control.'],
    ['True-peak limiter', 'Oversampled ceiling with inter-sample detection and a hold-and-release read-out.'],
    ['Delivery metering', 'Loudness and true peak in one strip, so the master leaves at the level you intended.']
  ];

  return shell({
    title: 'Mastering Suite — StudioZIO Mastering Chain for macOS',
    description: `${product.name} ${product.version} for macOS in AU, VST3, and Standalone formats. Developer ID signed and Apple notarized.`,
    canonical: MASTERING_SUITE_WEBSITE,
    current: 'mastering',
    content: `<section class="hero tech-grid">
      <div class="shell">
        <div class="hero-grid">
          <div class="rise">
            <p class="eyebrow">Master bus · Version ${escapeHtml(product.version)}</p>
            <h1>The whole master,<span class="accent">one signal path.</span></h1>
            <p class="lede">${escapeHtml(product.description)}</p>
            <div class="hero-actions">
              <a class="btn btn-primary" href="#download-title">Download for macOS</a>
              <a class="btn" href="#modules-title">See the modules</a>
            </div>
            <div class="chip-row mt-md">
              ${chip(product.compactFormats.replaceAll(' / ', ' · '))}${chip(product.platform)}${chip(product.notarization, 'signal')}
            </div>
          </div>
          <div class="panel rise rise-2">${masteringSuiteMock()}</div>
        </div>
      </div>
    </section>
    <section class="section" aria-labelledby="modules-title">
      <div class="shell">
        <div class="section-head">
          <p class="eyebrow">Architecture</p>
          <h2 id="modules-title">Six modules, one gain structure</h2>
        </div>
        <div class="card-grid card-grid--3">
          ${modules
            .map(
              ([name, copy], index) => `<article class="panel module-card">
            <span class="idx">${String(index + 1).padStart(2, '0')}</span>
            <h3>${escapeHtml(name)}</h3>
            <p>${escapeHtml(copy)}</p>
          </article>`
            )
            .join('')}
        </div>
      </div>
    </section>
    <section class="section" aria-labelledby="spec-title">
      <div class="shell">
        <div class="section-head">
          <p class="eyebrow">Specification</p>
          <h2 id="spec-title">What ships</h2>
        </div>
        <dl class="spec-grid">
          <div><dt>Formats</dt><dd>${formatList(product.formats)}</dd></div>
          <div><dt>Platform</dt><dd>${escapeHtml(product.platform)}</dd></div>
          <div><dt>Version</dt><dd>${escapeHtml(product.version)}</dd></div>
          <div><dt>Signing</dt><dd>${escapeHtml(product.signing)}</dd></div>
          <div><dt>Notarization</dt><dd>${escapeHtml(product.notarization)}</dd></div>
          <div><dt>Availability</dt><dd>${escapeHtml(product.availability)}</dd></div>
        </dl>
      </div>
    </section>
    ${downloadComponent(product)}
    <section class="section" aria-labelledby="distribution-title">
      <div class="shell">
        <div class="section-head">
          <p class="eyebrow">Distribution</p>
          <h2 id="distribution-title">Public, versioned, verifiable</h2>
        </div>
        <p class="lede">The installer is distributed from the public StudioZIO binary-release registry, pinned to this exact release rather than a moving link.</p>
        <p class="mt-md"><a class="btn" href="${escapeHtml(product.releaseUrl)}">View the release record</a></p>
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
    content: `<section class="hero tech-grid">
      <div class="shell">
        <div class="rise">
          <p class="eyebrow">StudioZIO software · Coming Soon</p>
          <h1>ZIO MixRack</h1>
          <p class="lede">${escapeHtml(product.description)} Build a signal chain from StudioZIO processing modules and shape a mix from one unified interface.</p>
          <div class="chip-row mt-lg">
            ${chip(product.manufacturer)}${chip(product.platform)}${chip('Coming Soon', 'signal')}
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
    </section>`
  });
}

export function renderSystem() {
  const swatches = [
    ['background', 'Page base'],
    ['surface-raised', 'Cards and panels'],
    ['surface-overlay', 'Headers and chips'],
    ['surface-control', 'Knob tracks and wells'],
    ['primary', 'Deep instrument cyan. Actions, curves, active state.'],
    ['primary-deep', 'Pressed and inactive accent.'],
    ['signal', 'Amber. Meters and release flags only — never an action.'],
    ['destructive', 'Clip and error only.']
  ];
  return shell({
    title: 'Design System — StudioZIO',
    description:
      'The shared StudioZIO design system: one token set, one logo lockup, and one motion language across the hub, Mastering Suite and Tempo Delay.',
    canonical: `${HUB_ORIGIN}/system/`,
    current: 'system',
    content: `<section class="hero tech-grid">
      <div class="shell">
        <div class="rise">
          <p class="eyebrow">Design system</p>
          <h1>One system.<span class="accent">Three properties.</span></h1>
          <p class="lede">A single token set, logo lockup and motion language for the StudioZIO hub, Mastering Suite and Tempo Delay.</p>
        </div>
      </div>
    </section>
    <section class="section" aria-labelledby="identity-title">
      <div class="shell">
        <div class="section-head">
          <p class="eyebrow">Identity</p>
          <h2 id="identity-title">A single lockup</h2>
          <p class="lede">The mark is a waveform stroke in the accent on an overlay tile; the product name sits in mono beside the wordmark, never as a second logo.</p>
        </div>
        <div class="card-grid card-grid--3">
          <div class="panel module-card"><span class="idx">Hub</span>${logo({ link: false })}</div>
          <div class="panel module-card"><span class="idx">Product site</span>${logo({ suffix: 'Mastering Suite', link: false })}</div>
          <div class="panel module-card"><span class="idx">Compact</span>${logo({ suffix: 'Tempo Delay', link: false })}</div>
        </div>
      </div>
    </section>
    <section class="section" aria-labelledby="color-title">
      <div class="shell">
        <div class="section-head">
          <p class="eyebrow">Color</p>
          <h2 id="color-title">A surface ramp you can see</h2>
          <p class="lede">Each step lifts lightness by a fixed amount and pairs with a hairline border plus a real shadow, so panels read as objects rather than smudges.</p>
        </div>
        <ul class="card-grid card-grid--3">
          ${swatches
            .map(
              ([token, note]) => `<li class="panel swatch">
            <span class="swatch-sample swatch--${token}"></span>
            <span class="module-card swatch-body">
              <code class="idx">${escapeHtml(token)}</code>
              <span class="swatch-note">${escapeHtml(note)}</span>
            </span>
          </li>`
            )
            .join('')}
        </ul>
      </div>
    </section>
    <section class="section" aria-labelledby="type-title">
      <div class="shell">
        <div class="section-head">
          <p class="eyebrow">Type and motion</p>
          <h2 id="type-title">Three families, one rhythm</h2>
        </div>
        <dl class="spec-grid">
          <div><dt>Display</dt><dd>Space Grotesk 600/700 — headings, tight leading, balanced wrapping.</dd></div>
          <div><dt>Body</dt><dd>Inter Tight 400/500 — paragraphs capped at a 62-character measure.</dd></div>
          <div><dt>Technical</dt><dd>JetBrains Mono 400/500 — eyebrows, navigation, spec keys and parameter IDs.</dd></div>
          <div><dt>Fast motion</dt><dd>140 ms — hover and colour changes.</dd></div>
          <div><dt>Base motion</dt><dd>260 ms — surface and border transitions.</dd></div>
          <div><dt>Reduced motion</dt><dd>Every animation collapses when the visitor asks for less.</dd></div>
        </dl>
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
