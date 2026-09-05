# StudioZIO Web

Official multi-product website for StudioZIO software.

The site is a static, Vercel-compatible presentation layer. Product binaries are distributed through versioned assets in the public [StudioZIO Releases](https://github.com/StudioZIO/StudioZIO-Releases/releases) repository and are never committed here.

## Development

```sh
npm install
npm run check
npm run dev
```

The production build is written to `dist/`.

The first-class product catalogue is `/products/`. It shares product cards and
metadata with the home page, appears in the shared navigation and sitemap, and
links to each product's authoritative site. `/products/mastering-suite/` keeps
its permanent redirect to the Mastering Suite site.

`npm run check` includes the built catalogue contract and regression probes for
missing pages, redirects, canonical/sitemap drift, hidden cards and inconsistent
structured data. Product versions and availability come from `src/catalog.mjs`;
MixRack has no asserted release date or download.
