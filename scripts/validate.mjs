import { readFileSync, statSync } from 'node:fs';
import { dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mediaSeconds } from '../src/media.mjs';
import {
  getProduct,
  products,
  MASTERING_SUITE_WEBSITE,
  MIXRACK_WEBSITE,
  RELEASE_REPOSITORY_URL,
  TEMPO_DELAY_WEBSITE
} from '../src/catalog.mjs';
import { notes } from '../src/notes.mjs';
import {
  renderCommunity,
  renderCommunityQuestions,
  renderCommunityIdeas,
  renderCommunityCompatibility,
  renderCommunityKnownIssues,
  renderCommunityRoadmap,
  renderContact,
  renderDownloads,
  renderEngineering,
  renderHome,
  renderLegal,
  renderMixRackKnownIssues,
  renderMixRackProduct,
  renderNotFound,
  renderNote,
  renderNotes,
  renderPress,
  renderProducts,
  renderSearch,
  renderSupport,
  HUB_ORIGIN,
} from '../src/site.mjs';

const INSTAGRAM_URL = 'https://www.instagram.com/studio_zio_plugin/';
const KVR_URLS = [
  'https://www.kvraudio.com/product/studiozio-tempo-delay-by-studiozio',
  'https://www.kvraudio.com/product/studiozio-mastering-suite-by-studiozio'
];
const forbidden = [
  /github\.com\/StudioZIO\/(?!(StudioZIO-Releases|Support))/i,
  /\/Users\/mert\//i,
  /StudioZIO-Master-Plugin-Suite/i,
  /\bCodex\b/i,
  /\bLEVEL_4\b/i,
  /\bP[0-3]\b/,
  /localhost/i,
  /tempo-delay\.vercel\.app/i
];

function mainContent(page) {
  return page.split('<main id="main-content">')[1].split('</main>')[0];
}

function isSemanticPatch(version) {
  return /^\d+\.\d+\.\d+$/.test(version);
}

export function validateSource() {
  if (products.length !== 3) throw new Error('Unexpected public product count');
  const expectedOrder = ['mastering-suite', 'tempo-delay', 'mixrack'];
  if (products.some((product, index) => product.slug !== expectedOrder[index])) {
    throw new Error('Public product order drift');
  }

  const product = getProduct('mastering-suite');
  if (!isSemanticPatch(product.version) || product.platform !== 'macOS') {
    throw new Error('Public release metadata drift');
  }
  // The installer is named by the release pipeline, which emits
  // StudioZIO-Mastering-Suite-<version>.pkg. The earlier
  // -v<version>-macOS-arm64 name came from a hand-run build and was
  // misleading besides: every format in the package is Universal, not arm64.
  if (product.filename !== `StudioZIO-Mastering-Suite-${product.version}.pkg`) {
    throw new Error('Filename drift');
  }
  if (!product.downloadUrl.startsWith(`${RELEASE_REPOSITORY_URL}/releases/download/`)) {
    throw new Error('Download URL repository drift');
  }
  if (!product.downloadUrl.endsWith(`/${product.filename}`)) {
    throw new Error('Download URL filename drift');
  }
  const downloadTag = product.downloadUrl.split('/releases/download/')[1]?.split('/')[0];
  const releaseTag = product.releaseUrl.split('/releases/tag/')[1];
  if (!downloadTag || downloadTag !== releaseTag) {
    throw new Error('Release tag mismatch between download and release URLs');
  }
  if (!/^[a-f0-9]{64}$/i.test(product.sha256)) {
    throw new Error('Invalid checksum format');
  }
  if (RELEASE_REPOSITORY_URL !== 'https://github.com/StudioZIO/StudioZIO-Releases') {
    throw new Error('Release repository drift');
  }
  if (MASTERING_SUITE_WEBSITE !== 'https://studioziomasteringsuite.vercel.app/') {
    throw new Error('Mastering Suite website drift');
  }

  const tempoDelay = getProduct('tempo-delay');
  if (!/^[a-f0-9]{64}$/i.test(tempoDelay.sha256)) {
    throw new Error('Invalid checksum format for Tempo Delay');
  }
  if (
    tempoDelay.name !== 'StudioZIO Tempo Delay' ||
    tempoDelay.availability !== 'Available now' ||
    !isSemanticPatch(tempoDelay.version) ||
    tempoDelay.platform !== 'macOS' ||
    tempoDelay.compactFormats !== 'AU / VST3 / AAX / Standalone' ||
    tempoDelay.detailsUrl !== TEMPO_DELAY_WEBSITE ||
    TEMPO_DELAY_WEBSITE !== 'https://www.tempodelay.tech/' ||
    tempoDelay.filename !== `StudioZIOTempoDelay-v${tempoDelay.version}-macOS-arm64-AAX.pkg` ||
    tempoDelay.downloadUrl !== `${RELEASE_REPOSITORY_URL}/releases/download/tempo-delay-v${tempoDelay.version}-aax-2026.09.10/${tempoDelay.filename}` ||
    tempoDelay.releaseUrl !== `${RELEASE_REPOSITORY_URL}/releases/tag/tempo-delay-v${tempoDelay.version}-aax-2026.09.10`
  ) {
    throw new Error('Tempo Delay public metadata drift');
  }
  /* The hub states versions and availability; it does not host downloads. A
     download URL, release URL or release date here would be a second copy of
     something the product site owns, free to drift and with no gate to catch
     it. The version is the one figure both properties must agree on, so it is
     asserted above rather than banned. */
  for (const unsupportedField of ['releaseDate']) {
    if (tempoDelay[unsupportedField] !== undefined) {
      throw new Error(`Unsupported Tempo Delay field: ${unsupportedField}`);
    }
  }

  const mixRack = getProduct('mixrack');
  if (
    mixRack.name !== 'StudioZIO MixRack' ||
    mixRack.manufacturer !== 'StudioZIO' ||
    mixRack.version !== '1.0.0' ||
    mixRack.availability !== 'Launches 29 September 2026' ||
    mixRack.platform !== 'macOS' ||
    mixRack.compactFormats !== 'AU / VST3 / AAX / Standalone' ||
    mixRack.architecture !== 'Universal — Apple Silicon and Intel' ||
    mixRack.releaseDate !== '2026-09-29' ||
    mixRack.filename !== 'StudioZIO-Mixrack-1.0.0.pkg' ||
    mixRack.detailsUrl !== '/products/mixrack/' ||
    mixRack.launchSiteUrl !== MIXRACK_WEBSITE ||
    mixRack.releaseUrl !== `${RELEASE_REPOSITORY_URL}/releases/tag/mixrack-v1.0.0` ||
    !/^[a-f0-9]{64}$/i.test(mixRack.sha256)
  ) {
    throw new Error('MixRack public metadata drift');
  }
  if (mixRack.downloadUrl !== undefined) {
    throw new Error('MixRack public download must remain absent before launch');
  }

  const home = renderHome();
  const catalog = renderProducts();
  const contact = renderContact();
  const downloads = renderDownloads();
  const engineering = renderEngineering();
  const support = renderSupport();
  const legal = renderLegal();
  const mixRackProduct = renderMixRackProduct();
  const mixRackKnownIssues = renderMixRackKnownIssues();
  const notFound = renderNotFound();
  const notesIndex = renderNotes();
  // Every note in notes.mjs, not a list repeated here: the build derives its
  // routes the same way, so a note can never be published unvalidated.
  const notePages = notes.map((note) => renderNote(note.slug));
  const press = renderPress();
  const community = renderCommunity();
  const communityQuestions = renderCommunityQuestions();
  const communityIdeas = renderCommunityIdeas();
  const communityCompatibility = renderCommunityCompatibility();
  const communityKnownIssues = renderCommunityKnownIssues();
  const communityRoadmap = renderCommunityRoadmap();
  const search = renderSearch();
  const communityPages = [
    communityQuestions,
    communityIdeas,
    communityCompatibility,
    communityKnownIssues,
    communityRoadmap
  ];
  const permanentPages = [downloads, engineering, support, legal, mixRackProduct, mixRackKnownIssues];
  const pages = [home, catalog, ...permanentPages, contact, notesIndex, ...notePages, press, community, ...communityPages, search, notFound];
  const indexablePages = [home, catalog, ...permanentPages, contact, notesIndex, ...notePages, press, community, ...communityPages, search];
  for (const page of pages) {
    if (!page.includes('<meta name="viewport"')) throw new Error('Viewport metadata missing');
    if (!page.includes('Skip to content')) throw new Error('Skip link missing');
    if (!page.includes('<main id="main-content">')) throw new Error('Main landmark missing');
    if (!/\/assets\/styles-[0-9a-f]{10}\.css/.test(page)) {
      throw new Error('Stylesheet missing, or not the fingerprinted name the build writes');
    }
    for (const pattern of forbidden) {
      if (pattern.test(page)) throw new Error(`Forbidden public content: ${pattern}`);
    }
  }

  /* Mastering's retired hub path must stay out of generated pages. MixRack is
     deliberately different now: the hub path is the permanent authority,
     while the existing microsite remains the launch experience. */
  for (const [index, page] of pages.entries()) {
    for (const retired of ['/products/mastering-suite']) {
      if (page.includes(retired)) {
        throw new Error(`Page ${index} still links the retired local page ${retired}`);
      }
    }
  }

  /* The product sites are no longer in the header, so they are not on every
     page any more: the catalogue surfaces are where they have to be reachable
     from, and that is what is checked. */
  /* A figure a note declares is a figure the build can draw, and the script
     that moves it ships with exactly the notes that carry one. A figure whose
     renderer went missing would otherwise fail at request time, on a page
     nobody was looking at. */
  /* Every note is an article and says so, with a date that is the note's own.
     Structured data that disagrees with the page is worse than none: it is
     the version a search engine believes. */
  for (const [index, note] of notes.entries()) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(note.published || '')) {
      throw new Error(`Note ${note.slug} has no published date`);
    }
    const page = notePages[index];
    const blocks = [...page.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
    if (blocks.length !== 1) throw new Error(`Note ${note.slug} carries ${blocks.length} structured-data blocks, wanted 1`);
    const graph = JSON.parse(blocks[0][1])['@graph'];
    const article = graph.find((node) => node['@type'] === 'TechArticle');
    if (!article) throw new Error(`Note ${note.slug} declares no TechArticle`);
    if (article.headline !== note.heading) throw new Error(`Note ${note.slug}: structured headline drift`);
    if (article.datePublished !== note.published) throw new Error(`Note ${note.slug}: structured date drift`);
    if (!article.image.endsWith(`og-note-${note.slug}.png`)) throw new Error(`Note ${note.slug}: structured image drift`);
  }

  /* Each figure names the script that moves it and the markup that proves it
     rendered. A note carries exactly the scripts its figures need: no figure,
     no script; one figure, one script. */
  const FIGURE_CONTRACT = {
    'per-stage-oversampling': {
      script: 'os-figure.js',
      /* The four rates are the plug-in's, and the note's own prose states
         them a paragraph above; if the two ever drift, the one a reader plays
         with is the one they will believe. */
      markup: ['class="osfig"', 'data-os="stage"', 'data-rate="4"', 'data-rate="8"', 'data-rate="16"']
    },
    'expected-tp-derivation': {
      script: 'tp-figure.js',
      markup: ['class="tpfig"', 'data-ceiling="-1.0"', 'tpfig-expected', 'Fixed allowance', 'not known from here']
    },
    'two-delay-lines': {
      script: 'delay-lines-figure.js',
      markup: ['class="dlfig"', 'data-left="1/4"', 'data-right="1/8."', 'dlfig-readout']
    },
    'binary-architecture': {
      script: 'architecture-figure.js',
      /* The slices are the note's subject and the catalogue's metadata; a
         figure that lost one would answer the reader's question wrongly. */
      markup: ['class="archfig"', 'data-slices="arm64 x86_64"', 'data-slices="arm64"', 'data-machine="intel"']
    },
    'feedback-loop': {
      script: 'loop-figure.js',
      markup: ['class="loopfig"', 'data-place="after"', 'data-repeats="8"', 'loopfig-repeats']
    },
    'reported-latency': {
      script: 'latency-figure.js',
      /* Zero is the figure's default and the note's claim; a dial that opened
         anywhere else would be stating something the note does not. */
      markup: ['class="latfig"', 'data-latency="0"', 'latfig-block--shifted']
    }
  };
  const FIGURE_SCRIPTS = Object.values(FIGURE_CONTRACT).map((figure) => figure.script);

  for (const [index, note] of notes.entries()) {
    const page = notePages[index];
    const declared = note.body.map((part) => part.figure).filter(Boolean);
    for (const name of declared) {
      const contract = FIGURE_CONTRACT[name];
      if (!contract) throw new Error(`Note ${note.slug} declares an unknown figure: ${name}`);
      for (const required of contract.markup) {
        if (!page.includes(required)) throw new Error(`Note ${note.slug}: the ${name} figure is missing ${required}`);
      }
    }
    const wanted = new Set(declared.map((name) => FIGURE_CONTRACT[name].script));
    for (const script of FIGURE_SCRIPTS) {
      const loaded = page.includes(`/assets/${script}`);
      if (loaded !== wanted.has(script)) {
        throw new Error(`Note ${note.slug} ${loaded ? 'loads' : 'does not load'} ${script}, which is ${wanted.has(script) ? 'required' : 'not used'} here`);
      }
    }
  }

  /* One card per note, named after the note. Sharing a single card across the
     library is what this replaced: twelve notes arrived in a timeline looking
     like the same link. */
  const noteCards = new Set();
  for (const [index, note] of notes.entries()) {
    const page = notePages[index];
    const wanted = `${HUB_ORIGIN}/assets/og/og-note-${note.slug}.png`;
    if (!page.includes(`<meta property="og:image" content="${wanted}">`)) {
      throw new Error(`Note ${note.slug} does not declare its own share card`);
    }
    if (noteCards.has(wanted)) throw new Error(`Two notes share the card ${wanted}`);
    noteCards.add(wanted);
  }

  for (const catalogPage of [home, catalog]) {
    if (!catalogPage.includes('href="/products/mixrack/"')) {
      throw new Error('A catalogue surface has no link to the permanent MixRack page');
    }
  }

  for (const catalogPage of [home, catalog]) {
    for (const required of [
      'StudioZIO Mastering Suite',
      'StudioZIO Tempo Delay',
      'StudioZIO MixRack',
      'Available now',
      'Launches 29 September 2026',
      TEMPO_DELAY_WEBSITE
    ]) {
      if (!catalogPage.includes(required)) {
        throw new Error(`Catalog fact missing: ${required}`);
      }
    }
  }

  // The Tempo Delay site left the header with the other two products, so it
  // is reached from the catalogue rather than from every page. What must hold
  // is that both catalogue surfaces carry it on the product card itself.
  for (const catalogPage of [home, catalog]) {
    if (!catalogPage.includes(TEMPO_DELAY_WEBSITE)) {
      throw new Error('Catalog surfaces must link Tempo Delay from its product card');
    }
  }

  // One logo lockup in the header and one in the footer of every page.
  // (The system page also renders lockup variants inside its content, so the
  // count is asserted per-landmark rather than per-page.)
  for (const page of pages) {
    const headerMarkup = page.split('</header>')[0];
    const footerMarkup = page.split('<footer')[1] ?? '';
    if (headerMarkup.split('class="logo"').length - 1 !== 1) {
      throw new Error('Expected exactly one logo lockup in the header');
    }
    if (footerMarkup.split('class="logo"').length - 1 !== 1) {
      throw new Error('Expected exactly one logo lockup in the footer');
    }
    /* The five entries every StudioZIO header carries. The product names left
       this list with the product links; they are checked on the catalogue
       surfaces instead. */
    for (const label of ['>Hub<', '>Products<', '>Notes<', '>Community<', '>Contact<']) {
      if (!page.includes(label)) throw new Error(`Navigation label missing: ${label}`);
    }
    if (!page.includes(`href="${INSTAGRAM_URL}"`)) throw new Error('Instagram footer link missing');
    for (const url of KVR_URLS) {
      if (!page.includes(`href="${url}"`)) throw new Error(`KVR link missing: ${url}`);
    }
  }

  for (const forbiddenClaim of ['testimonial', 'award-winning', 'benchmark']) {
    if (pages.some((page) => page.includes(forbiddenClaim))) {
      throw new Error(`Unsupported public claim: ${forbiddenClaim}`);
    }
  }
  const APPROVED_WINDOWS_STATEMENTS = [
    'No Windows or Linux builds are currently planned',
    'Windows and Linux builds are not currently planned',
  ];

  for (const page of pages) {
    let sanitizedPage = page;
    for (const statement of APPROVED_WINDOWS_STATEMENTS) {
      sanitizedPage = sanitizedPage.replaceAll(statement, '');
    }
    if (sanitizedPage.includes('Windows')) {
      throw new Error('Unsupported public claim: Windows');
    }
  }

  // vercel.json serves the site under `style-src 'self'` with no
  // 'unsafe-inline', so a browser drops every style="" attribute. That failure
  // is silent — the page still renders, just with the layout the attribute was
  // carrying, which is how the mastering-suite mock ended up collapsing on top
  // of its own heading in production while every local check passed. Keep the
  // header strict and keep the markup free of inline styles instead.
  for (const [index, page] of pages.entries()) {
    const inlineStyles = page.match(/<[^>]+\sstyle="[^"]*"/g);
    if (inlineStyles) {
      throw new Error(
        `Inline style attribute on page ${index} is dropped by the site's own `
        + `Content-Security-Policy; move it into styles.css: ${inlineStyles[0]}`
      );
    }
    if (/<style[\s>]/.test(page)) {
      throw new Error(`Inline <style> element on page ${index} is blocked by the CSP`);
    }
    // The same header has no 'unsafe-inline' for scripts either, so an inline
    // <script> body would be dropped just as silently. Every script the site
    // ships has to be a src= reference to a file the build actually emits.
    const inlineScripts = (page.match(/<script(?![^>]*\ssrc=)[^>]*>/g) ?? [])
      .filter((tag) => !/\stype="application\/ld\+json"/.test(tag));
    if (inlineScripts.length) {
      throw new Error(
        `Inline <script> on page ${index} is blocked by the site's own `
        + `Content-Security-Policy; move it into a file under src/: ${inlineScripts[0]}`
      );
    }
  }

  // The Google tag has to be on every page, or the pages that lost it go
  // uncounted while the reports still look healthy. Assert all three parts:
  // the same-origin init, Google's loader with this property's measurement
  // ID, and the consent banner that gates it in the opt-in regions.
  for (const [index, page] of pages.entries()) {
    for (const required of [
      '<script src="/assets/gtag.js"></script>',
      'https://www.googletagmanager.com/gtag/js?id=G-VL8Z542XMP',
      '<script src="/assets/consent.js" defer></script>'
    ]) {
      if (!page.includes(required)) {
        throw new Error(`Google tag missing on page ${index}: ${required}`);
      }
    }
  }

  /* DebugView is opt-in, and both halves of that matter. Without the opt-in
     the screen stays empty however many events arrive, which reads as broken
     measurement and is not — that is exactly how this was found. With the flag
     left on unconditionally the opposite happens: every real visitor is
     reported as debug traffic, which GA4 treats differently, and the loss is
     silent. Assert the wiring exists AND that it is still conditional. */
  const sourceRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../src');
  const gtagSource = readFileSync(resolve(sourceRoot, 'gtag.js'), 'utf8');
  for (const required of ['_dbg', 'debug_mode']) {
    if (!gtagSource.includes(required)) {
      throw new Error(`gtag.js no longer wires up DebugView: ${required} is missing`);
    }
  }
  /* Every line that switches debug_mode on must be the guarded one. Matching
     the value instead of the shape was not enough: `debug_mode: true` inside
     the config literal and `CONFIG.debug_mode = true` after it are both ways
     to leave it on, and a check written for the first form let the second
     through when it was tried. */
  for (const line of gtagSource.split('\n')) {
    if (!/debug_mode/.test(line) || !/\btrue\b/.test(line)) continue;
    if (line.includes('if (studioZioDebug)')) continue;
    throw new Error(`debug_mode is switched on outside the opt-in guard, so every real visitor would be reported as debug traffic: ${line.trim()}`);
  }

  // A support form that renders but cannot submit loses messages quietly, so
  // the three parts that carry a submission are asserted, not assumed: the
  // form itself, every required field, and the script that posts it.
  for (const required of [
    'class="panel-float support-form"',
    '<script src="/assets/contact.js" defer></script>',
    'name="name"',
    'name="email"',
    'name="message"',
    'class="form-status"'
  ]) {
    if (!contact.includes(required)) {
      throw new Error(`Contact page is missing a submission-critical part: ${required}`);
    }
  }

  // Only the contact page carries the form script; loading it elsewhere would
  // be dead weight, and its absence here is the failure that matters.
  for (const [index, page] of pages.entries()) {
    if (page !== contact && page.includes('/assets/contact.js')) {
      throw new Error(`Page ${index} loads the contact script but has no form`);
    }
  }

  /* The release-notice and tester-interest forms moved to the MixRack site
     with the page they belong to. Nothing here may still load their scripts:
     a script with no form is dead weight, and a form with no script is worse.
     Same rule as the contact form above, in the other direction. */
  for (const [index, page] of pages.entries()) {
    for (const gone of ['/assets/notify.js', '/assets/tester.js', '/assets/video.js']) {
      if (page.includes(gone)) throw new Error(`Page ${index} still loads ${gone}, which moved to the MixRack site`);
    }
  }

  /* The trap this site is built to fall into: `form-action 'none'` in
     vercel.json means a native form submission is refused by the browser, and
     refused silently -- the form renders, validates, submits, and the message
     goes nowhere. Both forms therefore post by fetch and neither may carry an
     action attribute, because an action attribute is the thing that makes a
     form look submittable when it is not. Asserted rather than trusted: this
     is invisible in a browser until someone reports a message that never
     arrived. */
  for (const [index, page] of pages.entries()) {
    for (const [, attrs] of page.matchAll(/<form([^>]*)>/g)) {
      if (/\baction=/.test(attrs)) {
        throw new Error(
          `Page ${index} has a <form action=...>, which form-action 'none' refuses `
            + `silently; post it by fetch instead: <form${attrs}>`
        );
      }
    }
    // A form with no status element cannot tell the visitor either outcome.
    const formCount = (page.match(/<form\b/g) || []).length;
    const statusCount = (page.match(/class="form-status"/g) || []).length;
    if (formCount !== statusCount) {
      throw new Error(`Page ${index} has ${formCount} form(s) but ${statusCount} status element(s)`);
    }
  }

  /* The contact form posts to Formspree, and connect-src is the only reason
     that is allowed to leave the page. If the endpoint host ever changes
     without the policy changing with it, the form breaks in production and
     nowhere else. (The MixRack forms moved to studioziomixrack.vercel.app and
     that site's own validator holds the same rule for them.) */
  const endpoints = new Set(
    [readFileSync(resolve(sourceRoot, 'contact.js'), 'utf8')]
      .flatMap((code) => [...code.matchAll(/ENDPOINT = '([^']+)'/g)].map((m) => m[1]))
  );
  if (endpoints.size !== 1) {
    throw new Error(`Expected the contact form to post to one endpoint; found ${[...endpoints].join(', ')}`);
  }
  const policy = readFileSync(resolve(sourceRoot, '..', 'vercel.json'), 'utf8');
  for (const endpoint of endpoints) {
    const origin = new URL(endpoint).origin;
    if (!policy.includes(origin)) {
      throw new Error(`CSP connect-src must allow ${origin} or both forms fail in production`);
    }
  }

  // The A/B section is two cards, and a card that renders but cannot play is
  // worse than no card: the page keeps claiming a comparison it will not make.
  // Assert the parts that carry playback rather than assuming them.
  const abCards = home.split('data-ab="card"').length - 1;
  if (abCards !== 2) {
    throw new Error(`Expected two A/B cards on the home page, found ${abCards}`);
  }
  for (const required of [
    '<script src="/assets/ab.js" defer></script>',
    'data-take="dry"',
    'data-take="wet"',
    'data-ab="play"',
    'data-ab="take"',
    'data-ab="meter-fill"',
    'data-ab="progress-bar"',
    'type="audio/ogg; codecs=opus"',
    'type="audio/mp4; codecs=mp4a.40.2"'
  ]) {
    if (!home.includes(required)) {
      throw new Error(`A/B section is missing a playback-critical part: ${required}`);
    }
  }

  // Only the home page carries the listener.
  for (const [index, page] of pages.entries()) {
    if (page !== home && page.includes('/assets/ab.js')) {
      throw new Error(`Page ${index} loads the A/B listener but has no cards`);
    }
  }

  /* Every image reserves its own space.

     An <img> without intrinsic width and height occupies zero height until its
     bytes arrive, then shoves everything below it down the page. That is the
     single largest source of layout shift on a content site, and it is silent:
     it does not fail a build, it does not look wrong locally on a fast link,
     and it only shows up as a Core Web Vitals number weeks later.

     The hub measures 0.0002 CLS today — with fonts delayed 1.2s and with the
     whole page scrolled, both of which were checked — because both of its
     images carry width and height. This keeps it that way.

     Comments are stripped first: prose about an <img> is not an <img>. */
  for (const [index, page] of pages.entries()) {
    const markup = page.replace(/<!--[\s\S]*?-->/g, '');
    for (const tag of markup.match(/<img\b[^>]*>/g) ?? []) {
      if (/\bwidth=/.test(tag) && /\bheight=/.test(tag)) continue;
      throw new Error(`Page ${index} has an image with no reserved space: ${tag.slice(0, 90)}`);
    }
  }

  // Conversion measurement rides on every page, unlike the listener: a
  // data-event attribute added to any page must report without someone
  // remembering to load the file that reports it.
  for (const [index, page] of pages.entries()) {
    if (!page.includes('/assets/events.js')) {
      throw new Error(`Page ${index} carries no conversion measurement`);
    }
  }

  // The A/B toggle is the hub's one conversion. Both takes on both cards must
  // declare it, or the report fills in for one product and silently not the
  // other.
  const declaredToggles = (home.match(/data-event="ab_toggle"/g) || []).length;
  if (declaredToggles !== 4) {
    throw new Error(`Expected 4 declared A/B toggles (two takes on two cards); found ${declaredToggles}`);
  }
  for (const product of ['mastering-suite', 'tempo-delay']) {
    if (!home.includes(`data-ev-product="${product}"`)) {
      throw new Error(`The ${product} A/B card reports no product parameter`);
    }
  }

  // Every render and capture the markup names has to exist, and be the format
  // its extension claims. A missing or mistyped path is invisible until a
  // visitor presses play and nothing happens, which is exactly the failure
  // that should not reach production.
  const mediaRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../src/media');
  const signatures = {
    '.opus': (buffer) => buffer.subarray(0, 4).toString('ascii') === 'OggS',
    '.m4a': (buffer) => buffer.subarray(4, 8).toString('ascii') === 'ftyp',
    '.webp': (buffer) =>
      buffer.subarray(0, 4).toString('ascii') === 'RIFF'
      && buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  };
  const referenced = [...home.matchAll(/\/assets\/media\/([\w.-]+)/g)].map((match) => match[1]);
  if (referenced.length === 0) throw new Error('A/B section references no media');
  for (const name of new Set(referenced)) {
    const file = resolve(mediaRoot, name);
    let payload;
    try {
      payload = readFileSync(file);
    } catch {
      throw new Error(`A/B media referenced but not present in src/media: ${name}`);
    }
    const check = signatures[extname(name)];
    if (!check) throw new Error(`Unexpected A/B media type: ${name}`);
    if (!check(payload)) {
      throw new Error(`A/B media is not the format its name claims: ${name}`);
    }
    if (payload.length < 1024) {
      throw new Error(`A/B media is too small to be a real render: ${name}`);
    }
  }

  // The two takes in a pair have to be the same passage at the same length.
  // If one is a different render the switch stops being a comparison, and
  // nothing about the page would look wrong while it happened.
  for (const [dry, wet] of [['master-dry', 'master-wet'], ['delay-dry', 'delay-wet']]) {
    const drift = Math.abs(mediaSeconds(dry) - mediaSeconds(wet));
    if (drift > 0.05) {
      throw new Error(
        `A/B pair lengths disagree by ${drift.toFixed(3)}s: ${dry} vs ${wet}`
      );
    }
  }

  // The player divides by this, so a card that lost it would report a
  // position of zero for the whole passage.
  const declared = [...home.matchAll(/data-length="([\d.]+)"/g)].map((m) => Number(m[1]));
  if (declared.length !== 2 || declared.some((value) => !(value > 1))) {
    throw new Error(`Each A/B card must declare a real length; got ${declared.join(', ')}`);
  }

  /* ---- SEO route and metadata contract --------------------------------
     Each assertion stands for a defect that was live: canonicals disagreeing
     with the form the host serves, a summary_large_image card with no image
     behind it, and a site declaring no organisation at all. Invisible in a
     browser; only a crawler pays for them.
     The trailing-slash rule reads the other way round from how it first
     shipped. The original defect was a canonical naming /contact/ while
     vercel.json said trailingSlash: false, so the canonical pointed at a
     redirect; that was fixed by dropping the slash from the canonical. The
     estate has since settled on slash-always -- the artist site and the
     Mastering Suite site are directory-served and cannot do anything else --
     so the host was moved instead of the canonicals, and every hub URL now
     ends in a slash. Either resolution fixes the original defect; only one of
     them makes the four properties agree. */
  const single = (page, pattern, label, index) => {
    const found = [...page.matchAll(pattern)];
    if (found.length !== 1) throw new Error(`Expected exactly one ${label} on page ${index}, found ${found.length}`);
    return found[0][1];
  };

  for (const [index, page] of indexablePages.entries()) {
    const title = single(page, /<title>([^<]*)<\/title>/g, '<title>', index).trim();
    if (title.length < 20 || title.length > 65) {
      throw new Error(`Page ${index} title should read as a full result line, 20-65 chars; got ${title.length}: ${title}`);
    }
    const description = single(page, /<meta name="description" content="([^"]*)">/g, 'meta description', index);
    if (description.length < 70 || description.length > 165) {
      throw new Error(`Page ${index} meta description should be 70-165 chars; got ${description.length}`);
    }
    const headingMarkup = single(page, /<h1[^>]*>([\s\S]*?)<\/h1>/g, '<h1>', index);
    /* A heading split across an inline element loses the space between the two
       halves unless the markup carries it: "like<span>hardware" renders as
       "likehardware". Checking the markup boundary rather than the rendered
       text is what keeps deliberate camel case like "MixRack" from tripping
       this. Both product sites shipped this defect. */
    if (/\S<(?:span|em|strong|b|i)\b/.test(headingMarkup)) {
      throw new Error(
        `Heading on page ${index} runs a word straight into an inline element, so the rendered text loses a space: ${headingMarkup.slice(0, 90)}`
      );
    }

    const canonical = single(page, /<link rel="canonical" href="([^"]*)">/g, 'rel=canonical', index);
    if (!canonical.endsWith('/')) {
      throw new Error(`Canonical on page ${index} names a URL the host redirects away from: ${canonical}`);
    }
    if (!canonical.startsWith(`${HUB_ORIGIN}/`)) {
      throw new Error(`Canonical on page ${index} is off-origin: ${canonical}`);
    }
    if (single(page, /<meta property="og:url" content="([^"]*)">/g, 'og:url', index) !== canonical) {
      throw new Error(`og:url and canonical disagree on page ${index}`);
    }
    for (const [pattern, label] of [
      [/<meta property="og:image" content="([^"]*)">/g, 'og:image'],
      [/<meta property="og:image:alt" content="([^"]*)">/g, 'og:image:alt'],
      [/<meta name="twitter:image" content="([^"]*)">/g, 'twitter:image'],
      [/<meta name="twitter:image:alt" content="([^"]*)">/g, 'twitter:image:alt']
    ]) {
      if (!single(page, pattern, label, index).trim()) throw new Error(`Empty ${label} on page ${index}`);
    }
    const ogImage = single(page, /<meta property="og:image" content="([^"]*)">/g, 'og:image', index);
    if (!ogImage.startsWith(`${HUB_ORIGIN}/assets/og/`)) {
      throw new Error(`Social image must be self-hosted from /assets/og/: ${ogImage}`);
    }
    if (/<meta name="keywords"/.test(page)) throw new Error(`Page ${index} carries a meta keywords tag`);
    /* Every card the pages declare is a real file of a plausible size. A card
       that 404s does not fail a build; it just makes every share of that page
       arrive blank. */
    const cardFile = ogImage.slice(`${HUB_ORIGIN}/assets/og/`.length);
    const card = statSync(resolve(dirname(fileURLToPath(import.meta.url)), '../src/og', cardFile));
    if (card.size < 10_000) throw new Error(`${cardFile} is ${card.size} bytes, too small to be a 1200x630 card`);
    if (/<meta name="robots"[^>]*noindex/.test(page)) throw new Error(`Page ${index} carries noindex`);
  }

  /* ---- one URL form per page ------------------------------------------
     vercel.json declares trailingSlash: true, so the host 308s /contact to
     /contact/. Any internal link written without the slash therefore costs a
     redirect on the way to a page this site owns. That had already happened
     in the other direction: catalog.mjs wrote detailsUrl: '/products/mixrack/'
     while the route table and the canonical both said '/products/mixrack',
     so the home page's only product link redirected. Rather than pin a second
     copy of the route table here, the set of pages this site owns is read off
     the canonicals the pages themselves declare -- so a link and a canonical
     cannot disagree without one of them failing this. */
  const ownPages = new Set(
    indexablePages.map((page) => {
      const declared = single(page, /<link rel="canonical" href="([^"]*)">/g, 'rel=canonical', -1);
      return declared.slice(HUB_ORIGIN.length);
    })
  );
  /* Files the build writes rather than pages it renders: they are real URLs,
     they are simply not in the route table. */
  const fileRoutes = new Set(['/sitemap.xml', '/robots.txt', '/feed.xml']);
  for (const [index, page] of pages.entries()) {
    for (const [, href] of page.matchAll(/href="([^"]*)"/g)) {
      if (!href.startsWith('/') || href.startsWith('/assets/')) continue;
      if (fileRoutes.has(href)) continue;
      if (!ownPages.has(href)) {
        throw new Error(
          `Page ${index} links to ${href}, which is not a URL this site serves. `
            + `Own pages: ${[...ownPages].join(', ')}`
        );
      }
    }
  }

  const ldBlocks = [...home.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  if (ldBlocks.length !== 1) {
    throw new Error(`Expected exactly one JSON-LD block on the home page, found ${ldBlocks.length}`);
  }
  let graph;
  try {
    graph = JSON.parse(ldBlocks[0][1]);
  } catch (error) {
    throw new Error(`Home page JSON-LD does not parse: ${error.message}`);
  }
  const types = graph['@graph'].map((node) => node['@type']);
  for (const required of ['Organization', 'WebSite']) {
    if (!types.includes(required)) throw new Error(`Home page JSON-LD is missing a ${required} node`);
  }
  const organization = graph['@graph'].find((node) => node['@type'] === 'Organization');
  // Tempo Delay's graph points at this exact @id. If they drift, the estate
  // describes two organisations that happen to share a name.
  if (organization['@id'] !== `${HUB_ORIGIN}/#organization`) {
    throw new Error(`Organization @id must be the shared estate id; got ${organization['@id']}`);
  }
  if (JSON.stringify(graph).includes('aggregateRating')) {
    throw new Error('JSON-LD must not publish a rating that does not exist');
  }

  const hosting = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
  if (hosting.redirects.some(({ source }) => source === '/products' || source === '/products/')) {
    throw new Error('The product catalogue must be served, not redirected');
  }
  if (!catalog.includes(`<link rel="canonical" href="${HUB_ORIGIN}/products/">`)) {
    throw new Error('Product catalogue must declare its own canonical');
  }
  for (const page of [home, contact]) {
    if (!mainContent(page).includes('href="/products/"')) {
      throw new Error('Product catalogue contextual link missing');
    }
  }

  verifyMeasurementPolicy();
}

/* ---- the CSP has to let the tag finish measuring -------------------------
   GA reported this property's tag as partially blocked, and it was. The
   policy allowed gtag.js and the primary /g/collect beacon -- so page views
   and events did arrive, which is why nothing looked wrong -- but refused
   Google Analytics' identity layer. Measured rather than guessed: a probe
   served each StudioZIO policy as a real response header and listened for
   securitypolicyviolation while requesting every endpoint gtag.js uses.
   Since CSP is evaluated before the network fetch, a violation event means
   the policy refused it, and no event means the policy allowed it -- which
   separates policy refusals from this container's blocked egress. Five
   endpoints were refused, identically on all four properties:

     img-src      stats.g.doubleclick.net    Google Signals hit
     img-src      www.google.com             audience ping
     connect-src  stats.g.doubleclick.net    Signals beacon
     frame-src    td.doubleclick.net         Signals cookie-sync frame
     frame-src    www.googletagmanager.com   tag frame

   The two frame refusals came from having no frame-src at all, so
   `default-src 'self'` governed frames. All four properties now share one
   measurement ID with cross-domain linking, and that identity layer is what
   stitches a visit across them -- blocked, the four domains read as four
   unrelated sessions.

   Hosts are named, not wildcarded past what is needed: *.doubleclick.net
   would admit the ad-serving hosts and nothing here wants them. Nothing else
   in the policy moved -- no 'unsafe-inline', no wider script-src -- and the
   probe re-run confirmed three controls (an off-origin fetch, a CDN script,
   an off-origin pixel) are still refused. */
const REQUIRED_MEASUREMENT_HOSTS = {
  'script-src': ['https://www.googletagmanager.com'],
  'img-src': [
    'https://*.google-analytics.com',
    'https://*.g.doubleclick.net',
    'https://www.google.com'
  ],
  'connect-src': [
    'https://*.google-analytics.com',
    'https://*.analytics.google.com',
    'https://*.g.doubleclick.net',
    'https://www.google.com'
  ],
  'frame-src': ['https://td.doubleclick.net', 'https://www.googletagmanager.com']
};

function verifyMeasurementPolicy() {
  const config = JSON.parse(
    readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), '..', 'vercel.json'), 'utf8')
  );
  const header = config.headers
    .flatMap((entry) => entry.headers)
    .find((entry) => entry.key.toLowerCase() === 'content-security-policy');
  if (!header) throw new Error('vercel.json serves no Content-Security-Policy');

  const directives = new Map(
    header.value
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => [part.split(/\s+/)[0], part.split(/\s+/).slice(1)])
  );
  for (const [directive, hosts] of Object.entries(REQUIRED_MEASUREMENT_HOSTS)) {
    const allowed = directives.get(directive);
    if (!allowed) {
      throw new Error(
        `CSP has no ${directive}, so default-src governs it and GA4 loses `
          + `${hosts.join(' and ')}`
      );
    }
    for (const host of hosts) {
      if (!allowed.includes(host)) {
        throw new Error(`CSP ${directive} must allow ${host} or GA4 measurement is blocked there`);
      }
    }
  }
  // The additions above are measurement, not a general opening. Anything that
  // would let arbitrary third-party code run is still refused.
  for (const directive of ['script-src', 'style-src']) {
    if ((directives.get(directive) ?? []).includes("'unsafe-eval'")) {
      throw new Error(`CSP ${directive} must not allow 'unsafe-eval'`);
    }
  }
  if ((directives.get('script-src') ?? []).includes("'unsafe-inline'")) {
    throw new Error("CSP script-src must not allow 'unsafe-inline'");
  }
  if ((directives.get('object-src') ?? []).join(' ') !== "'none'") {
    throw new Error("CSP object-src must stay 'none'");
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  validateSource();
  console.log('StudioZIO website validation PASS');
}
