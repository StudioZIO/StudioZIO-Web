export const RELEASE_REPOSITORY_URL =
  'https://github.com/StudioZIO/StudioZIO-Releases';

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
    availability: 'Available now'
  })
]);

export function getProduct(slug) {
  const product = products.find((candidate) => candidate.slug === slug);
  if (!product) {
    throw new Error(`Unknown product slug: ${slug}`);
  }
  return product;
}
