import { getProduct, products, RELEASE_REPOSITORY_URL } from '../src/catalog.mjs';
import { renderHome, renderMasteringSuite, renderNotFound, renderProducts } from '../src/site.mjs';

const expectedUrl =
  'https://github.com/StudioZIO/StudioZIO-Releases/releases/download/v2.0.0/StudioZIO-Mastering-Suite-2.0.0.pkg';
const expectedSha =
  'c84cce49e651451409550daaac97f358220bcf7398183369e03f55b25d51793d';
const forbidden = [
  /github\.com\/StudioZIO\/(?!StudioZIO-Releases)/i,
];

export function validateSource() {
  if (products.length !== 1) throw new Error('Unexpected public product count');
  const product = getProduct('mastering-suite');
  if (product.downloadUrl !== expectedUrl) throw new Error('Download URL drift');
  if (product.sha256 !== expectedSha) throw new Error('Checksum drift');
  if (product.version !== '2.0.0' || product.platform !== 'macOS') {
    throw new Error('Public release metadata drift');
  }
  if (RELEASE_REPOSITORY_URL !== 'https://github.com/StudioZIO/StudioZIO-Releases') {
    throw new Error('Release repository drift');
  }

  const pages = [renderHome(), renderProducts(), renderMasteringSuite(), renderNotFound()];
  for (const page of pages) {
    if (!page.includes('<meta name="viewport"')) throw new Error('Viewport metadata missing');
    if (!page.includes('Skip to content')) throw new Error('Skip link missing');
    if (!page.includes('<main id="main-content">')) throw new Error('Main landmark missing');
    if (!page.includes('/assets/styles.css')) throw new Error('Stylesheet missing');
    for (const pattern of forbidden) {
      if (pattern.test(page)) throw new Error(`Forbidden public content: ${pattern}`);
    }
  }

  const mastering = pages[2];
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

  for (const forbiddenClaim of ['Windows', 'testimonial', 'award-winning', 'benchmark']) {
    if (pages.some((page) => page.includes(forbiddenClaim))) {
      throw new Error(`Unsupported public claim: ${forbiddenClaim}`);
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  validateSource();
  console.log('StudioZIO website validation PASS');
}
