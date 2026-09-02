# Share cards

`og-studiozio.png` and `og-mixrack.png` are 1200×630 Open Graph cards, generated
rather than drawn: the same OKLCH tokens, the same three typefaces and the same
tech-grid background as the site, rendered in a headless browser and captured at
exactly 1200×630.

To regenerate, render an HTML card at that viewport with the woff2 files from
`src/fonts/` embedded as data URIs (so the capture does not depend on a network
font), and screenshot it. The build copies this directory to `/assets/og/`, and
`scripts/validate.mjs` asserts every page's `og:image` resolves under that path.

Keep them at 1200×630: the pages declare those dimensions in `og:image:width`
and `og:image:height`, and a mismatch makes some crawlers skip the card.
