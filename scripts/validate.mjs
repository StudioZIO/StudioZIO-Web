import {
  getProduct,
  products,
  MASTERING_SUITE_WEBSITE,
  RELEASE_REPOSITORY_URL,
  TEMPO_DELAY_WEBSITE
} from '../src/catalog.mjs';
import {
  renderHome,
  renderMasteringSuite,
  renderMixRack,
  renderNotFound,
  renderProducts,
  renderSystem
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
    tempoDelay.platform !== 'macOS' ||
    tempoDelay.compactFormats !== 'AU / VST3 / Standalone' ||
    tempoDelay.detailsUrl !== TEMPO_DELAY_WEBSITE ||
    TEMPO_DELAY_WEBSITE !== 'https://www.tempodelay.tech/'
  ) {
    throw new Error('Tempo Delay public metadata drift');
  }
  for (const unsupportedField of ['version', 'downloadUrl', 'releaseUrl', 'releaseDate']) {
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
  const productsPage = renderProducts();
  const mastering = renderMasteringSuite();
  const mixRackPage = renderMixRack();
  const systemPage = renderSystem();
  const pages = [home, productsPage, mastering, mixRackPage, systemPage, renderNotFound()];
  for (const page of pages) {
    if (!page.includes('<meta name="viewport"')) throw new Error('Viewport metadata missing');
    if (!page.includes('Skip to content')) throw new Error('Skip link missing');
    if (!page.includes('<main id="main-content">')) throw new Error('Main landmark missing');
    if (!page.includes('/assets/styles.css')) throw new Error('Stylesheet missing');
    for (const pattern of forbidden) {
      if (pattern.test(page)) throw new Error(`Forbidden public content: ${pattern}`);
    }
  }

  const downloadMatches = mastering.split(expectedUrl).length - 1;
  if (downloadMatches !== 1) throw new Error('Expected exactly one primary installer URL');
  for (const required of [
    'StudioZIO Mastering Suite',
    'Version 2.0.0',
    'macOS',
    'Audio Unit (AU)',
    'VST3',
    'Standalone',
    'Developer ID signed',
    'Apple notarized',
    'StudioZIO-Mastering-Suite-2.0.0.pkg',
    expectedSha
  ]) {
    if (!mastering.includes(required)) throw new Error(`Required public fact missing: ${required}`);
  }

  for (const catalogPage of [home, productsPage]) {
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
  for (const catalogPage of [home, productsPage]) {
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
    for (const label of ['>Hub<', '>Mastering Suite<', '>Tempo Delay<', '>System<']) {
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
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  validateSource();
  console.log('StudioZIO website validation PASS');
}
