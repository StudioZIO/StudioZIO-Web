import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const MEDIA_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), 'media');

/* Length of an Ogg Opus stream, in seconds, read from the file itself.

   Browsers disagree about this. Chromium reports an infinite duration for
   these streams until they are fully buffered, and an infinite duration makes
   a progress bar sit at zero for the whole passage — a readout that is not
   just useless but wrong. The build knows the real length, so it states it in
   the markup and the player trusts that over whatever the browser guesses.

   Opus always runs its timeline at 48 kHz regardless of the source rate, so
   the final page's granule position is a sample count at 48 kHz. Subtracting
   the pre-skip declared in the OpusHead packet gives the audible length. */
export function oggOpusSeconds(buffer) {
  const head = buffer.indexOf('OpusHead');
  if (head < 0) throw new Error('Not an Ogg Opus stream: no OpusHead packet');
  const preSkip = buffer.readUInt16LE(head + 10);

  let lastPage = -1;
  for (let i = buffer.length - 27; i >= 0; i -= 1) {
    if (
      buffer[i] === 0x4f && buffer[i + 1] === 0x67
      && buffer[i + 2] === 0x67 && buffer[i + 3] === 0x53
    ) {
      lastPage = i;
      break;
    }
  }
  if (lastPage < 0) throw new Error('Not an Ogg stream: no page header');

  const granule = buffer.readBigUInt64LE(lastPage + 6);
  const seconds = Number(granule - BigInt(preSkip)) / 48000;
  if (!(seconds > 0)) throw new Error('Ogg Opus stream reports no audible length');
  return seconds;
}

export function mediaSeconds(name) {
  return oggOpusSeconds(readFileSync(resolve(MEDIA_ROOT, `${name}.opus`)));
}
