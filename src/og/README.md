# Share cards

`og-studiozio.png`, `og-mixrack.png` and one `og-note-<slug>.png` per technical
note are 1200×630 Open Graph cards, generated rather than drawn: the same OKLCH tokens, the same three typefaces and the same
tech-grid background as the site, rendered in a headless browser and captured at
exactly 1200×630.

To regenerate, render an HTML card at that viewport with the woff2 files from
`src/fonts/` embedded as data URIs (so the capture does not depend on a network
font), and screenshot it. The build copies this directory to `/assets/og/`, and
`scripts/validate.mjs` asserts every page's `og:image` resolves under that path.

Keep them at 1200×630: the pages declare those dimensions in `og:image:width`
and `og:image:height`, and a mismatch makes some crawlers skip the card.

## The note cards

One per entry in `src/notes.mjs`, named `og-note-<slug>.png`. They carry the
note's own `heading` and nothing invented: the eyebrow reads `Technical note`,
the footer line reads `studiozio.vercel.app/notes`, and the lockup and grid are
the ones above.

The heading size is measured rather than chosen. Start at 84px and step down in
2px increments until the heading's bottom clears the hairline rule by 24px, so
a two-word title and a nine-word title sit on the same baseline. Everything
else — the 74/80/60 padding, the 96px gap under the lockup, the 26px gap under
the eyebrow — is the same as the two cards above.

`scripts/validate.mjs` asserts three things: every page's `og:image` is a real
file under this directory, no two notes declare the same card, and each note
declares the card named after its own slug. Adding a note therefore fails the
build until its card exists, which is the point.
