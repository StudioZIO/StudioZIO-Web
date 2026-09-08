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

`npm run verify:downloads` is separate, and is not part of `check`. It
downloads whatever `downloadUrl` points at and hashes it, so the only thing
that can satisfy it is the real file. Every other check compares one part of
the source against another — `validate.mjs` pins the same URL and SHA that
`catalog.mjs` declares — which cannot catch a release re-cut under the same
version number: the old tag keeps answering 200, nothing 404s, and the site
publishes a checksum for a file nobody has. That happened with Mastering Suite
2.1.1, which shipped twice five days apart. CI runs this on every push and pull
request, so a stale checksum cannot reach `main`.

## Deploying

This repository is the canonical source for `https://studiozio.vercel.app/`.
The Vercel project `studiozio` builds it with `npm run build` and serves
`dist/`, as declared in `vercel.json`.

**Production is deployed by the Vercel Git integration, from `main`, and by
nothing else.** Every production deployment must name the commit it was built
from. Do not run `vercel deploy` — or any other manual publish — from a
workstation: it creates a production deployment with no branch and no commit,
which silently replaces a reviewed one and leaves no way to tell what is live.

So the deployment path is: branch → pull request → `npm run check` → merge into
`main` → Vercel builds and promotes automatically. To re-deploy without a
content change, use Redeploy on the latest `main` deployment in the Vercel
dashboard, which keeps the commit attached. If production ever shows a
deployment whose source is `vercel deploy` instead of a branch and commit, that
is the defect: promote a `main` deployment again so the live site is traceable.

The hub is one of three surfaces. The rule and the repository-to-project
mapping for all of them are recorded in `docs/CANONICAL-ARCHITECTURE.md` in the
[TempoDelay](https://github.com/StudioZIO/TempoDelay) repository. A change here
does not authorize rebuilding or repointing another surface.
