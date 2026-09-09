import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';
import { products } from '../src/catalog.mjs';

async function verifyDownloads() {
  let hasFailures = false;

  for (const product of products) {
    if (!product.downloadUrl) {
      console.log(`SKIP ${product.name} — no direct catalog release artifact\n`);
      continue;
    }

    console.log(`VERIFY ${product.name} ${product.version}`);
    console.log(`URL: ${product.downloadUrl}`);
    console.log(`Asset: ${product.filename}`);

    try {
      // 1. Validate metadata
      if (!product.slug || !product.name || !product.version || !product.filename || !product.sha256) {
        throw new Error('Missing required release metadata in catalog');
      }

      // 2. Validate SHA format
      if (!/^[a-f0-9]{64}$/i.test(product.sha256)) {
        throw new Error(`Invalid sha256 format: ${product.sha256}`);
      }

      // 3. Temporary destination
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'studiozio-verify-'));
      const tmpFile = path.join(tmpDir, product.filename);

      try {
        // 4. Fetch
        const response = await fetch(product.downloadUrl);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status} ${response.statusText}`);
        }

        // Check redirect origin - either github.com or *.githubusercontent.com
        const resUrl = new URL(response.url);
        if (resUrl.hostname !== 'github.com' && !resUrl.hostname.endsWith('githubusercontent.com')) {
          throw new Error(`Redirected to untrusted origin: ${resUrl.hostname}`);
        }

        // Check empty download (Content-Length)
        const contentLength = response.headers.get('content-length');
        if (contentLength === '0') {
          throw new Error('Download is empty (content-length = 0)');
        }

        // 5. Download and hash
        const fileStream = fs.createWriteStream(tmpFile);
        await pipeline(Readable.fromWeb(response.body), fileStream);

        const stats = fs.statSync(tmpFile);
        if (stats.size === 0) {
          throw new Error('Downloaded file is empty (size = 0)');
        }
        
        console.log(`Bytes: ${stats.size}`);

        const fileBuffer = fs.readFileSync(tmpFile);
        const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

        console.log(`SHA-256: ${hash}`);

        // 6. Compare
        if (hash !== product.sha256) {
          throw new Error(`Checksum mismatch!\n  Expected: ${product.sha256}\n  Actual:   ${hash}`);
        }

        console.log('PASS\n');
      } finally {
        // 7. Cleanup
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    } catch (err) {
      console.error(`FAIL: ${err.message}\n`);
      hasFailures = true;
    }
  }

  if (hasFailures) {
    process.exit(1);
  }
}

verifyDownloads().catch(err => {
  console.error(err);
  process.exit(1);
});
