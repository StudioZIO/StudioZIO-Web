import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { products } from '../src/catalog.mjs';

const origin = 'https://studiozio.vercel.app';
const paths = ['index.html', 'products/index.html', 'products/mixrack/index.html', 'contact/index.html', '404.html', 'sitemap.xml'];
const baseline = {
  files: Object.fromEntries(paths.map(path => [path, readFileSync(new URL(`../dist/${path}`, import.meta.url), 'utf8')])),
  hosting: JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'))
};

function verify({ files, hosting }) {
  const page = files['products/index.html'];
  assert.ok(page, 'Built catalogue page missing');
  assert.ok(page.includes(`<link rel="canonical" href="${origin}/products/">`), 'Catalogue canonical drift');
  assert.equal(hosting.trailingSlash, true);
  assert.ok(!hosting.redirects.some(({ source }) => ['/products', '/products/'].includes(source)), 'Catalogue redirected');
  const urls = [...files['sitemap.xml'].matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
  assert.deepEqual(urls, ['/', '/products/', '/products/mixrack/', '/contact/'].map(path => origin + path));
  const blocks = [...page.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  assert.equal(blocks.length, 1);
  const collection = JSON.parse(blocks[0][1])['@graph'].find(node => node['@type'] === 'CollectionPage');
  assert.equal(collection.url, origin + '/products/');
  const list = collection.mainEntity;
  const cards = [...page.matchAll(/<article class="panel product-card">([\s\S]*?)<\/article>/g)].map(match => match[1]);
  assert.equal(cards.length, products.length, 'Visible product count drift');
  assert.equal(list.numberOfItems, cards.length);
  assert.equal(list.itemListElement.length, cards.length);
  products.forEach((product, index) => {
    const entry = list.itemListElement[index];
    assert.equal(entry.position, index + 1);
    assert.equal(entry.item.name, product.name);
    assert.equal(entry.item.url, new URL(product.detailsUrl, origin).href);
    assert.equal(entry.item.softwareVersion, product.version);
    assert.equal(entry.item.description, `${product.description} ${product.availability}.`);
    assert.ok(cards[index].includes(`<h3>${product.name}</h3>`));
    assert.ok(cards[index].includes(product.description));
    assert.ok(cards[index].includes(product.availability));
    assert.ok(cards[index].includes(`href="${product.detailsUrl}"`));
    if (product.version) assert.ok(cards[index].includes(`v${product.version}`));
    if (product.slug === 'mixrack') {
      for (const invented of ['offers', 'downloadUrl', 'datePublished']) assert.equal(entry.item[invented], undefined);
    }
  });
  for (const path of paths.filter(path => path.endsWith('.html'))) {
    const html = files[path];
    for (const section of [html.split('</header>')[0], html.split('<footer')[1]]) {
      assert.match(section, /href="\/products\/"[^>]*>Products<\/a>/, `${path}: catalogue navigation missing`);
    }
    if (['index.html', 'products/mixrack/index.html', 'contact/index.html'].includes(path)) {
      assert.ok(html.split('<main id="main-content">')[1].split('</main>')[0].includes('href="/products/"'), `${path}: contextual link missing`);
    }
  }
}

verify(baseline);
const mutations = [
  ['missing output', data => delete data.files['products/index.html']],
  ['missing sitemap URL', data => data.files['sitemap.xml'] = data.files['sitemap.xml'].replace(`<loc>${origin}/products/</loc>`, '')],
  ['root canonical', data => data.files['products/index.html'] = data.files['products/index.html'].replace(`rel="canonical" href="${origin}/products/"`, `rel="canonical" href="${origin}/"`)],
  ['retired redirect', data => data.hosting.redirects.push({ source: '/products/', destination: '/', permanent: true })],
  ['hidden card', data => data.files['products/index.html'] = data.files['products/index.html'].replace(/<article class="panel product-card">[\s\S]*?<\/article>/, '')],
  ['structured name drift', data => data.files['products/index.html'] = data.files['products/index.html'].replace('"name": "ZIO MixRack"', '"name": "Unknown"')],
  ['missing contextual link', data => data.files['contact/index.html'] = data.files['contact/index.html'].replace('href="/products/">product catalogue', 'href="/">product catalogue')]
];
for (const [label, mutate] of mutations) {
  const data = structuredClone(baseline);
  mutate(data);
  assert.throws(() => verify(data), undefined, `${label}: regression was accepted`);
}
console.log(`Products artifact contract PASS: 1 positive, ${mutations.length} negative cases; 3 cards, 4 sitemap URLs.`);
