/* Asks the actual file whether the catalogue is telling the truth.

   Every other check in this repository compares one part of the source against
   another: validate.mjs pins the same URL and SHA that catalog.mjs declares, so
   the two cannot drift apart. That guard is real, and it is also blind in one
   direction — if both are edited to the same wrong value, or if a release is
   re-cut under the same version number and neither is edited at all, every
   check still passes and the site publishes a checksum for a file nobody has.

   That happened. Mastering Suite 2.1.1 shipped twice, five days apart, with
   the same version number and different bytes. The older tag stayed published
   and kept answering 200, so nothing 404'd and nothing failed: the press kit
   simply handed out the previous binary with a checksum that matched it, while
   the product site told the same reader to run shasum and expect the new one.

   Two of our own pages disagreeing about a checksum does not read to a visitor
   as a version mix-up. On a page that says signed, notarized, verify it
   yourself, it reads as a tampered download.

   So this script leaves the source tree: it downloads what downloadUrl points
   at and hashes it. The only thing that can satisfy it is the real file.

   It is not part of `npm run check`, which runs many times a day and should
   not fetch tens of megabytes to tell you your HTML is fine. It runs in CI on
   every push and pull request, where forgetting it is not an option. */

import { createHash } from 'node:crypto';
import { products } from '../src/catalog.mjs';

/* A release asset is tens of megabytes and the hash is computed as it
   arrives, so nothing larger than a chunk is ever held in memory. */
async function sha256Of(url) {
  const response = await fetch(url, { redirect: 'follow' });

  if (!response.ok)
    throw new Error(`HTTP ${response.status} ${response.statusText}`);

  const hash = createHash('sha256');
  let bytes = 0;

  for await (const chunk of response.body) {
    hash.update(chunk);
    bytes += chunk.length;
  }

  return { digest: hash.digest('hex'), bytes };
}

/* Only products that publish a download and a checksum. MixRack has neither
   and Tempo Delay's provenance lives on its own site, so an empty list here
   would be a silent pass — the count is asserted at the end for that reason. */
const publishing = products.filter((product) => product.downloadUrl && product.sha256);

let failures = 0;
let offline = 0;

for (const product of publishing) {
  process.stdout.write(`${product.slug}: `);

  let result;

  try {
    result = await sha256Of(product.downloadUrl);
  } catch (error) {
    /* A network that is down is not evidence of a bad checksum, and reporting
       it as one would teach everybody to ignore this script. It is still not a
       pass: the run is inconclusive and says so, and CI has a network. */
    offline += 1;
    console.log(`COULD NOT CHECK — ${error.message}`);
    continue;
  }

  if (result.digest === product.sha256) {
    console.log(`OK ${result.digest} (${result.bytes.toLocaleString('en-GB')} bytes)`);
    continue;
  }

  failures += 1;
  console.log('MISMATCH');
  console.log(`  url       ${product.downloadUrl}`);
  console.log(`  published ${product.sha256}`);
  console.log(`  actual    ${result.digest}  (${result.bytes.toLocaleString('en-GB')} bytes)`);
  console.log('  The file at that URL is not the file the catalogue describes.');
  console.log('  Either the release was re-cut and catalog.mjs needs the new values,');
  console.log('  or downloadUrl points at the wrong release. Do not "fix" this by');
  console.log('  copying the actual hash in without checking which release is meant.');
}

if (publishing.length === 0) {
  console.error('VERIFY_DOWNLOADS_FAIL: no product publishes a downloadUrl and a sha256.');
  console.error('Nothing was checked. If that is deliberate, delete this script rather');
  console.error('than leaving it passing on an empty list.');
  process.exit(1);
}

if (failures > 0) {
  console.error(`\nVERIFY_DOWNLOADS_FAIL: ${failures} of ${publishing.length} did not match.`);
  process.exit(1);
}

if (offline > 0) {
  console.error(`\nVERIFY_DOWNLOADS_INCONCLUSIVE: ${offline} of ${publishing.length} unreachable.`);
  process.exit(1);
}

console.log(`\nVERIFY_DOWNLOADS_PASS: ${publishing.length} published download(s) match the catalogue.`);
