/* One text extractor, two callers: the build (for the hub's own rendered
   pages) and the refresher (for the other three sites' live HTML). Sharing it
   is the point -- a page from the hub and a page from the Tempo Delay site
   have to be reduced the same way, or the same phrase would rank differently
   depending on which site it sits on.

   It reads the rendered HTML rather than the source that produced it, so what
   gets indexed is what a visitor actually sees. The chrome is removed first:
   the header and footer repeat on every page, and indexing them would make
   every page match every menu word. */

const BLOCKS = ['script', 'style', 'header', 'footer', 'noscript', 'svg', 'template'];

const ENTITIES = new Map([
  ['amp', '&'], ['lt', '<'], ['gt', '>'], ['quot', '"'], ['apos', "'"],
  ['nbsp', ' '], ['mdash', '—'], ['ndash', '–'], ['hellip', '…'],
  ['rsquo', '’'], ['lsquo', '‘'], ['rdquo', '”'], ['ldquo', '“'], ['middot', '·']
]);

function decode(value) {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&([a-z]+);/gi, (whole, name) => ENTITIES.get(name.toLowerCase()) ?? whole);
}

function tidy(value) {
  return decode(value).replace(/\s+/g, ' ').trim();
}

function firstMatch(html, pattern) {
  const found = html.match(pattern);
  return found ? tidy(found[1]) : '';
}

/* The searchable body is capped. Nothing on these sites runs long enough to
   reach the cap today; it is here so that one day's long page cannot quietly
   turn a 60 KB index into a megabyte the visitor has to download first. */
const TEXT_LIMIT = 12000;

export function extract(html, url) {
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  let body = main ? main[1] : html.replace(/^[\s\S]*?<body\b[^>]*>/i, '');

  for (const tag of BLOCKS) {
    body = body.replace(new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}>`, 'gi'), ' ');
  }

  const headings = [...body.matchAll(/<h([1-3])\b[^>]*>([\s\S]*?)<\/h\1>/gi)]
    .map((match) => tidy(match[2].replace(/<[^>]+>/g, ' ')))
    .filter(Boolean);

  /* Block boundaries become a separator before the tags go. Without it a
     heading and the paragraph under it are glued into one sentence, and the
     snippet a visitor reads in the results says something neither of them
     said. */
  const separated = body
    .replace(/<\/(p|h[1-6]|li|td|th|dd|dt|figcaption|blockquote)>/gi, ' \u00b7 ')
    .replace(/<br\s*\/?>/gi, ' \u00b7 ');

  const text = tidy(separated.replace(/<[^>]+>/g, ' '))
    .replace(/(?:\s*\u00b7)+\s*/g, ' \u00b7 ')
    .replace(/^\s*\u00b7\s*/, '')
    .replace(/\s*\u00b7\s*$/, '')
    .slice(0, TEXT_LIMIT);

  return {
    url,
    title: firstMatch(html, /<title\b[^>]*>([\s\S]*?)<\/title>/i),
    description: firstMatch(html, /<meta\s+name="description"\s+content="([^"]*)"/i),
    headings,
    text
  };
}
