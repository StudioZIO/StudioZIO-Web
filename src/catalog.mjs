export const RELEASE_REPOSITORY_URL =
  'https://github.com/StudioZIO/StudioZIO-Releases';

export const MASTERING_SUITE_WEBSITE =
  'https://studioziomasteringsuite.vercel.app/';

export const TEMPO_DELAY_WEBSITE =
  'https://www.tempodelay.tech/';

/* The artist surface. Not a product, which is why it appears in the footer
   list and never in the header — but it is one of the four surfaces, and the
   Organization graph here names ZIO as founder by @id. A reference that
   nothing links to is a claim no crawler can follow, and until now this one
   had no link anywhere on the site. */
export const ZIO_WEBSITE = 'https://zio-audio.vercel.app/';

export const products = Object.freeze([
  Object.freeze({
    slug: 'mastering-suite',
    name: 'StudioZIO Mastering Suite',
    shortName: 'Mastering Suite',
    version: '2.1.1',
    platform: 'macOS',
    /* Stated per product, not assumed. Both products are arm64 only,
       and a hub that says only "macOS" sends Intel owners to a download
       that will not run. */
    architecture: 'Apple Silicon (arm64) only — no Intel build',
    formats: Object.freeze(['Audio Unit (AU)', 'VST3', 'AAX']),
    compactFormats: 'AU / VST3 / AAX',
    filename: 'StudioZIO-Mastering-Suite-v2.1.1-macOS-arm64.pkg',
    downloadUrl:
      'https://github.com/StudioZIO/StudioZIO-Releases/releases/download/mastering-suite-v2.1.1-aax-2026.09.10/StudioZIO-Mastering-Suite-v2.1.1-macOS-arm64.pkg',
    releaseUrl:
      'https://github.com/StudioZIO/StudioZIO-Releases/releases/tag/mastering-suite-v2.1.1-aax-2026.09.10',
    sha256:
      '7ac80cb1a340a92b1dc606254604b58b83907b0a1d594e29a77a39d807319ceb',
    signing: 'Developer ID signed',
    notarization: 'Apple notarized',
    price: 'Free',
    availability: 'Available now',
    description:
      'Nine mastering stages on one surface, in the order the audio takes, sharing one gain structure and one metering reference.',
    detailsUrl: MASTERING_SUITE_WEBSITE,
    externalDetails: true
  }),
  Object.freeze({
    slug: 'tempo-delay',
    name: 'StudioZIO Tempo Delay',
    shortName: 'Tempo Delay',
    platform: 'macOS',
    architecture: 'Apple Silicon (arm64) only — no Intel build',
    formats: Object.freeze(['Audio Unit (AU)', 'VST3', 'AAX']),
    compactFormats: 'AU / VST3 / AAX',
    price: 'Free',
    version: '4.0.1',
    filename: 'StudioZIOTempoDelay-v4.0.1-macOS-arm64-AAX.pkg',
    downloadUrl:
      'https://github.com/StudioZIO/StudioZIO-Releases/releases/download/tempo-delay-v4.0.1-aax-2026.09.10/StudioZIOTempoDelay-v4.0.1-macOS-arm64-AAX.pkg',
    releaseUrl:
      'https://github.com/StudioZIO/StudioZIO-Releases/releases/tag/tempo-delay-v4.0.1-aax-2026.09.10',
    sha256:
      '4e919c509cca196e178a0a991d24c02eb7e1ba81c5890e0f4fce16aba94ec055',
    availability: 'Available now',
    description:
      'Tempo-synced stereo delay with independent left and right timing, feedback shaping, and ping-pong spatial behavior.',
    detailsUrl: TEMPO_DELAY_WEBSITE,
    externalDetails: true
  }),
  Object.freeze({
    slug: 'mixrack',
    name: 'StudioZIO MixRack',
    shortName: 'StudioZIO MixRack',
    manufacturer: 'StudioZIO',
    platform: 'macOS',
    formats: Object.freeze(['Audio Unit (AU)', 'VST3', 'Standalone']),
    compactFormats: 'AU / VST3 / Standalone',
    availability: 'Coming soon',
    description:
      'A modular mixing environment that brings essential processing into one focused rack.',
    detailsUrl: '/products/mixrack/'
  })
]);

export function getProduct(slug) {
  const product = products.find((candidate) => candidate.slug === slug);
  if (!product) {
    throw new Error(`Unknown product slug: ${slug}`);
  }
  return product;
}
