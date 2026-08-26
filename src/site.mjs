import { getProduct, products, RELEASE_REPOSITORY_URL } from './catalog.mjs';

const stylesheet = '/assets/styles.css';

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

function shell({ title, description, current, content }) {
  const navigation = [
    ['Home', '/', 'home'],
    ['Products', '/products/', 'products']
  ];
  const navLinks = navigation
    .map(
      ([label, href, id]) =>
        `<a class="nav-link${current === id ? ' is-current' : ''}" href="${href}"${
          current === id ? ' aria-current="page"' : ''
        }>${label}</a>`
    )
    .join('');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#14161A">
  <meta name="description" content="${escapeHtml(description)}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="StudioZIO">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="${stylesheet}">
</head>
<body>
  <a class="skip-link" href="#main-content">Skip to content</a>
  <div class="site-shell">
    <header class="site-header">
      <a class="brand" href="/" aria-label="StudioZIO home">
        <span class="brand-mark" aria-hidden="true"><span></span><span></span><span></span></span>
        <span>StudioZIO</span>
      </a>
      <nav class="site-nav" aria-label="Primary navigation">
        ${navLinks}
        <a class="nav-release" href="${RELEASE_REPOSITORY_URL}/releases">Public releases <span aria-hidden="true">↗</span></a>
      </nav>
    </header>
    <main id="main-content">${content}</main>
    <footer class="site-footer">
      <div>
        <strong>StudioZIO</strong>
        <p>Professional audio software.</p>
      </div>
      <div class="footer-links">
        <a href="/products/">Products</a>
        <a href="${RELEASE_REPOSITORY_URL}/releases">Release downloads</a>
      </div>
      <p class="copyright">© 2026 StudioZIO</p>
    </footer>
  </div>
</body>
</html>`;
}

function productCard(product) {
  return `<article class="product-card">
    <div class="product-card-topline">
      <span class="status-dot" aria-hidden="true"></span>
      <span>${escapeHtml(product.availability)}</span>
      <span>v${escapeHtml(product.version)}</span>
    </div>
    <h3>${escapeHtml(product.name)}</h3>
    <p class="product-meta">${escapeHtml(product.platform)} · ${escapeHtml(product.compactFormats)}</p>
    <div class="product-card-actions">
      <a class="button button-primary" href="/products/${escapeHtml(product.slug)}/">Product details</a>
      <a class="text-link" href="${escapeHtml(product.releaseUrl)}">Release notes <span aria-hidden="true">↗</span></a>
    </div>
  </article>`;
}

function downloadComponent(product) {
  return `<section class="download-panel" aria-labelledby="download-title">
    <div class="download-copy">
      <p class="eyebrow">Official macOS installer</p>
      <h2 id="download-title">Download ${escapeHtml(product.shortName)}</h2>
      <p>Version ${escapeHtml(product.version)} · ${formatList(product.formats)}</p>
      <div class="trust-row" aria-label="Installer security">
        <span>${escapeHtml(product.signing)}</span>
        <span>${escapeHtml(product.notarization)}</span>
      </div>
    </div>
    <a class="button button-download" href="${escapeHtml(product.downloadUrl)}">Download for macOS <span aria-hidden="true">↓</span></a>
    <dl class="download-details">
      <div><dt>Installer</dt><dd><code>${escapeHtml(product.filename)}</code></dd></div>
      <div><dt>SHA-256</dt><dd><code class="checksum">${escapeHtml(product.sha256)}</code></dd></div>
    </dl>
  </section>`;
}

export function renderHome() {
  const primaryProduct = products[0];
  return shell({
    title: 'StudioZIO — Professional Audio Software',
    description:
      'StudioZIO creates professional audio software with clear product information and verified public downloads.',
    current: 'home',
    content: `<section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">Professional audio software</p>
        <h1>Tools for the work<br><span>between sound and finish.</span></h1>
        <p class="hero-lede">StudioZIO creates focused audio software for macOS, with versioned releases and independently verifiable downloads.</p>
        <div class="hero-actions">
          <a class="button button-primary" href="/products/">Explore products</a>
          <a class="button button-secondary" href="${RELEASE_REPOSITORY_URL}/releases">Public releases <span aria-hidden="true">↗</span></a>
        </div>
      </div>
      <aside class="release-signal" aria-label="Current StudioZIO release">
        <div class="signal-orbit" aria-hidden="true"><span></span></div>
        <p class="signal-label">Current release</p>
        <strong>${escapeHtml(primaryProduct.shortName)}</strong>
        <span>Version ${escapeHtml(primaryProduct.version)}</span>
        <div class="signal-divider"></div>
        <span>${escapeHtml(primaryProduct.platform)}</span>
        <span>${escapeHtml(primaryProduct.compactFormats)}</span>
      </aside>
    </section>
    <section class="section-block" aria-labelledby="current-product-title">
      <div class="section-heading">
        <div><p class="eyebrow">Product catalog</p><h2 id="current-product-title">Current software</h2></div>
        <a class="text-link" href="/products/">View all products <span aria-hidden="true">→</span></a>
      </div>
      <div class="product-grid">${products.map(productCard).join('')}</div>
    </section>
    <section class="architecture-section" aria-labelledby="release-architecture-title">
      <div class="section-heading compact"><div><p class="eyebrow">Built for clarity</p><h2 id="release-architecture-title">One catalog. Verified releases.</h2></div></div>
      <div class="principle-grid">
        <article><span>01</span><h3>Clear product facts</h3><p>Versions, platforms, and formats are presented without unsupported compatibility claims.</p></article>
        <article><span>02</span><h3>Version-pinned downloads</h3><p>Installer links resolve to immutable, public GitHub release assets.</p></article>
        <article><span>03</span><h3>Designed to expand</h3><p>The catalog is ready for future StudioZIO products without changing its structure.</p></article>
      </div>
    </section>`
  });
}

export function renderProducts() {
  return shell({
    title: 'Products — StudioZIO',
    description: 'Browse current StudioZIO professional audio software releases.',
    current: 'products',
    content: `<section class="page-hero">
      <p class="eyebrow">StudioZIO catalog</p>
      <h1>Products</h1>
      <p>Current StudioZIO software, with direct access to versioned public releases.</p>
    </section>
    <section class="section-block product-catalog" aria-label="StudioZIO products">
      <div class="product-grid">${products.map(productCard).join('')}</div>
    </section>`
  });
}

export function renderMasteringSuite() {
  const product = getProduct('mastering-suite');
  return shell({
    title: `${product.name} ${product.version} — StudioZIO`,
    description: `${product.name} ${product.version} for macOS in AU, VST3, and Standalone formats. Developer ID signed and Apple notarized.`,
    current: 'products',
    content: `<section class="product-hero">
      <div class="product-hero-copy">
        <p class="eyebrow">StudioZIO software · Version ${escapeHtml(product.version)}</p>
        <h1>${escapeHtml(product.shortName)}</h1>
        <p class="product-lede">A single macOS distribution for StudioZIO's mastering software across standalone and plug-in formats.</p>
        <div class="format-row" aria-label="Available formats">
          ${product.formats.map((format) => `<span>${escapeHtml(format)}</span>`).join('')}
        </div>
      </div>
      <div class="product-visual" aria-hidden="true">
        <div class="meter meter-a"><span></span></div>
        <div class="meter meter-b"><span></span></div>
        <div class="meter meter-c"><span></span></div>
        <div class="visual-disc"><span>2.0</span></div>
      </div>
    </section>
    <section class="fact-strip" aria-label="Release facts">
      <div><span>Platform</span><strong>${escapeHtml(product.platform)}</strong></div>
      <div><span>Version</span><strong>${escapeHtml(product.version)}</strong></div>
      <div><span>Distribution</span><strong>Signed + notarized</strong></div>
      <div><span>Formats</span><strong>${escapeHtml(product.compactFormats)}</strong></div>
    </section>
    ${downloadComponent(product)}
    <section class="release-separation" aria-labelledby="distribution-title">
      <div><p class="eyebrow">Distribution</p><h2 id="distribution-title">Public, versioned, verifiable.</h2></div>
      <div class="separation-copy">
        <p>The installer is distributed from StudioZIO's public binary-release registry. The download button is pinned to this exact release rather than a moving “latest” link.</p>
        <a class="text-link" href="${escapeHtml(product.releaseUrl)}">View the v${escapeHtml(product.version)} release record <span aria-hidden="true">↗</span></a>
      </div>
    </section>`
  });
}

export function renderNotFound() {
  return shell({
    title: 'Page not found — StudioZIO',
    description: 'The requested StudioZIO page could not be found.',
    current: '',
    content: `<section class="page-hero not-found"><p class="eyebrow">404</p><h1>Page not found</h1><p>The requested page is not available.</p><a class="button button-primary" href="/">Return home</a></section>`
  });
}
