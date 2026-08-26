import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderHome, renderMasteringSuite, renderNotFound, renderProducts } from '../src/site.mjs';
import { validateSource } from './validate.mjs';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputRoot = resolve(projectRoot, 'dist');

validateSource();
await rm(outputRoot, { recursive: true, force: true });

const outputs = new Map([
  ['index.html', renderHome()],
  ['products/index.html', renderProducts()],
  ['products/mastering-suite/index.html', renderMasteringSuite()],
  ['404.html', renderNotFound()]
]);

for (const [relativePath, content] of outputs) {
  const destination = resolve(outputRoot, relativePath);
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, content, 'utf8');
}

await mkdir(resolve(outputRoot, 'assets'), { recursive: true });
await cp(resolve(projectRoot, 'src/styles.css'), resolve(outputRoot, 'assets/styles.css'));
await writeFile(
  resolve(outputRoot, 'robots.txt'),
  'User-agent: *\nAllow: /\n',
  'utf8'
);

console.log(`Built ${outputs.size} HTML pages into dist/`);
