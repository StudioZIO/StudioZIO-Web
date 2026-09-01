import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  renderHome,
  renderMasteringSuite,
  renderMixRack,
  renderNotFound,
  renderProducts,
  renderSystem
} from '../src/site.mjs';
import { validateSource } from './validate.mjs';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputRoot = resolve(projectRoot, 'dist');

validateSource();
await rm(outputRoot, { recursive: true, force: true });

const outputs = new Map([
  ['index.html', renderHome()],
  ['products/index.html', renderProducts()],
  ['products/mastering-suite/index.html', renderMasteringSuite()],
  ['products/mixrack/index.html', renderMixRack()],
  ['system/index.html', renderSystem()],
  ['404.html', renderNotFound()]
]);

for (const [relativePath, content] of outputs) {
  const destination = resolve(outputRoot, relativePath);
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, content, 'utf8');
}

await mkdir(resolve(outputRoot, 'assets'), { recursive: true });
await cp(resolve(projectRoot, 'src/styles.css'), resolve(outputRoot, 'assets/styles.css'));
await cp(resolve(projectRoot, 'src/fonts'), resolve(outputRoot, 'assets/fonts'), { recursive: true });
await cp(resolve(projectRoot, 'src/favicon.svg'), resolve(outputRoot, 'assets/favicon.svg'));
// The Google tag's own two files. They ship from the site origin because the
// site's CSP has no 'unsafe-inline'; see the comment in src/site.mjs.
await cp(resolve(projectRoot, 'src/gtag.js'), resolve(outputRoot, 'assets/gtag.js'));
await cp(resolve(projectRoot, 'src/consent.js'), resolve(outputRoot, 'assets/consent.js'));
await writeFile(
  resolve(outputRoot, 'robots.txt'),
  'User-agent: *\nAllow: /\n',
  'utf8'
);

console.log(`Built ${outputs.size} HTML pages into dist/`);
