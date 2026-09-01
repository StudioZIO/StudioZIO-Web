export const RELEASE_REPOSITORY_URL =
  'https://github.com/StudioZIO/StudioZIO-Releases';

export const MASTERING_SUITE_WEBSITE =
  'https://studioziomasteringsuite.vercel.app/';

export const TEMPO_DELAY_WEBSITE =
  'https://www.tempodelay.tech/';

export const products = Object.freeze([
  Object.freeze({
    slug: 'mastering-suite',
    name: 'StudioZIO Mastering Suite',
    shortName: 'Mastering Suite',
    version: '2.0.0',
    platform: 'macOS',
    formats: Object.freeze(['Audio Unit (AU)', 'VST3', 'Standalone']),
    compactFormats: 'AU / VST3 / Standalone',
    filename: 'StudioZIO-Mastering-Suite-2.0.0.pkg',
    downloadUrl:
      'https://github.com/StudioZIO/StudioZIO-Releases/releases/download/v2.0.0/StudioZIO-Mastering-Suite-2.0.0.pkg',
    releaseUrl:
      'https://github.com/StudioZIO/StudioZIO-Releases/releases/tag/v2.0.0',
    sha256:
      'c84cce49e651451409550daaac97f358220bcf7398183369e03f55b25d51793d',
    signing: 'Developer ID signed',
    notarization: 'Apple notarized',
    price: 'Free',
    availability: 'Available now',
    description:
      'A single macOS distribution for StudioZIO mastering software across standalone and plug-in formats.',
    detailsUrl: MASTERING_SUITE_WEBSITE,
    externalDetails: true
  }),
  Object.freeze({
    slug: 'tempo-delay',
    name: 'StudioZIO Tempo Delay',
    shortName: 'Tempo Delay',
    platform: 'macOS',
    formats: Object.freeze(['Audio Unit (AU)', 'VST3', 'Standalone']),
    compactFormats: 'AU / VST3 / Standalone',
    price: 'Free',
    /* The shipping build is tagged RC1 and its release notes call it a
       testable beta, and the product site chips it the same way. "Available
       now" here said something the download did not support. */
    availability: 'Release candidate',
    description:
      'Tempo-synced stereo delay with independent left and right timing, feedback shaping, and ping-pong spatial behavior.',
    detailsUrl: TEMPO_DELAY_WEBSITE,
    externalDetails: true
  }),
  Object.freeze({
    slug: 'mixrack',
    name: 'ZIO MixRack',
    shortName: 'ZIO MixRack',
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
