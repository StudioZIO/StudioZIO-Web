import { readFileSync } from 'node:fs';
import { dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mediaSeconds } from '../src/media.mjs';
import {
  getProduct,
  products,
  MASTERING_SUITE_WEBSITE,
  RELEASE_REPOSITORY_URL,
  TEMPO_DELAY_WEBSITE
} from '../src/catalog.mjs';
import {
  renderContact,
  renderHome,
  renderMixRack,
  renderNotFound,
  HUB_ORIGIN,
} from '../src/site.mjs';

const expectedUrl =
  'https://github.com/StudioZIO/StudioZIO-Releases/releases/download/v2.0.0/StudioZIO-Mastering-Suite-2.0.0.pkg';
const expectedSha =
  'c84cce49e651451409550daaac97f358220bcf7398183369e03f55b25d51793d';
const forbidden = [
  /github\.com\/StudioZIO\/(?!StudioZIO-Releases)/i,
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

export function validateSource() {
  if (products.length !== 3) throw new Error('Unexpected public product count');
  const expectedOrder = ['mastering-suite', 'tempo-delay', 'mixrack'];
  if (products.some((product, index) => product.slug !== expectedOrder[index])) {
    throw new Error('Public product order drift');
  }

  const product = getProduct('mastering-suite');
  if (product.downloadUrl !== expectedUrl) throw new Error('Download URL drift');
  if (product.sha256 !== expectedSha) throw new Error('Checksum drift');
  if (product.version !== '2.0.0' || product.platform !== 'macOS') {
    throw new Error('Public release metadata drift');
  }
  if (RELEASE_REPOSITORY_URL !== 'https://github.com/StudioZIO/StudioZIO-Releases') {
    throw new Error('Release repository drift');
  }
  if (MASTERING_SUITE_WEBSITE !== 'https://studioziomasteringsuite.vercel.app/') {
    throw new Error('Mastering Suite website drift');
  }

  const tempoDelay = getProduct('tempo-delay');
  if (
    tempoDelay.name !== 'StudioZIO Tempo Delay' ||
    tempoDelay.availability !== 'Available now' ||
    tempoDelay.version !== '4.0.1' ||
    tempoDelay.platform !== 'macOS' ||
    tempoDelay.compactFormats !== 'AU / VST3 / Standalone' ||
    tempoDelay.detailsUrl !== TEMPO_DELAY_WEBSITE ||
    TEMPO_DELAY_WEBSITE !== 'https://www.tempodelay.tech/'
  ) {
    throw new Error('Tempo Delay public metadata drift');
  }
  /* The hub states versions and availability; it does not host downloads. A
     download URL, release URL or release date here would be a second copy of
     something the product site owns, free to drift and with no gate to catch
     it. The version is the one figure both properties must agree on, so it is
     asserted above rather than banned. */
  for (const unsupportedField of ['downloadUrl', 'releaseUrl', 'releaseDate']) {
    if (tempoDelay[unsupportedField] !== undefined) {
      throw new Error(`Unsupported Tempo Delay field: ${unsupportedField}`);
    }
  }

  const mixRack = getProduct('mixrack');
  if (
    mixRack.name !== 'ZIO MixRack' ||
    mixRack.manufacturer !== 'StudioZIO' ||
    mixRack.availability !== 'Coming soon' ||
    mixRack.platform !== 'macOS' ||
    mixRack.compactFormats !== 'AU / VST3 / Standalone'
  ) {
    throw new Error('MixRack public metadata drift');
  }
  for (const unsupportedField of ['version', 'downloadUrl', 'releaseUrl', 'releaseDate']) {
    if (mixRack[unsupportedField] !== undefined) {
      throw new Error(`Unsupported MixRack field: ${unsupportedField}`);
    }
  }

  const home = renderHome();
  const mixRackPage = renderMixRack();
  const contact = renderContact();
  const notFound = renderNotFound();
  const pages = [home, mixRackPage, contact, notFound];
  const indexablePages = [home, mixRackPage, contact];
  for (const page of pages) {
    if (!page.includes('<meta name="viewport"')) throw new Error('Viewport metadata missing');
    if (!page.includes('Skip to content')) throw new Error('Skip link missing');
    if (!page.includes('<main id="main-content">')) throw new Error('Main landmark missing');
    if (!page.includes('/assets/styles.css')) throw new Error('Stylesheet missing');
    for (const pattern of forbidden) {
      if (pattern.test(page)) throw new Error(`Forbidden public content: ${pattern}`);
    }
  }

  // The hub used to render its own mastering-suite page whose canonical already
  // pointed at the product site — two addresses for one product, and the hub
  // conceding which one was real. The product site owns those release facts
  // now; what has to hold here is that nothing links to the retired path.
  for (const [index, page] of pages.entries()) {
    if (page.includes('/products/mastering-suite')) {
      throw new Error(`Page ${index} still links the retired local mastering-suite page`);
    }
  }

  for (const catalogPage of [home]) {
    for (const required of [
      'StudioZIO Mastering Suite',
      'StudioZIO Tempo Delay',
      'ZIO MixRack',
      'Available now',
      'Coming soon',
      TEMPO_DELAY_WEBSITE
    ]) {
      if (!catalogPage.includes(required)) {
        throw new Error(`Catalog fact missing: ${required}`);
      }
    }
  }

  // The shared four-link navigation puts the Tempo Delay site in the header
  // and footer of every page, so the old exact-count rule no longer applies.
  // What must hold: it is reachable everywhere, and both catalog surfaces
  // still carry it on the product card itself.
  if (!pages.every((page) => page.includes(TEMPO_DELAY_WEBSITE))) {
    throw new Error('Tempo Delay site must be linked from every page');
  }
  for (const catalogPage of [home]) {
    const navAndFooterLinks = 2;
    if (catalogPage.split(TEMPO_DELAY_WEBSITE).length - 1 <= navAndFooterLinks) {
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
    for (const label of ['>Hub<', '>Mastering Suite<', '>Tempo Delay<', '>Contact<']) {
      if (!page.includes(label)) throw new Error(`Navigation label missing: ${label}`);
    }
  }

  const mixRackMain = mainContent(mixRackPage);
  for (const required of [
    'ZIO MixRack',
    'Coming Soon',
    'macOS',
    'Audio Unit (AU)',
    'VST3',
    'Standalone'
  ]) {
    if (!mixRackMain.includes(required)) {
      throw new Error(`MixRack fact missing: ${required}`);
    }
  }
  if (
    mixRackMain.includes('button-download') ||
    mixRackMain.includes(RELEASE_REPOSITORY_URL) ||
    /\bVersion\b/.test(mixRackMain) ||
    /\bDownload\b/i.test(mixRackMain)
  ) {
    throw new Error('MixRack page exposes release or download behavior');
  }

  for (const forbiddenClaim of ['Windows', 'testimonial', 'award-winning', 'benchmark']) {
    if (pages.some((page) => page.includes(forbiddenClaim))) {
      throw new Error(`Unsupported public claim: ${forbiddenClaim}`);
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
  const fileRoutes = new Set(['/sitemap.xml', '/robots.txt']);
  for (const [index, page] of [home, mixRackPage, contact, notFound].entries()) {
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

  // /products is permanently redirected to the root; nothing may link to it.
  if (pages.some((page) => /href="\/products"/.test(page))) {
    throw new Error('Nothing may link to the retired /products route');
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
