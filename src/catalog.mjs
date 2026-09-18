export const RELEASE_REPOSITORY_URL =
  'https://github.com/StudioZIO/StudioZIO-Releases';

export const MASTERING_SUITE_WEBSITE =
  'https://studioziomasteringsuite.vercel.app/';

export const TEMPO_DELAY_WEBSITE =
  'https://www.tempodelay.tech/';

/* MixRack has its own site now, the same way Mastering Suite and Tempo Delay
   do. The hub keeps the card and the header entry; the page itself lives
   there, and /products/mixrack redirects to it (see vercel.json). */
export const MIXRACK_WEBSITE =
  'https://studioziomixrack.vercel.app/';

/* The artist surface. Not a product, which is why it appears in the footer
   list and never in the header — but it is one of the four surfaces, and the
   Organization graph here names ZIO as founder by @id. A reference that
   nothing links to is a claim no crawler can follow, and until now this one
   had no link anywhere on the site. */
export const ZIO_WEBSITE = 'https://zio-audio.vercel.app/';

export const products = Object.freeze([
  /* The bundle. It is a catalogue product like any other, and its page is the
     one surface that lists the catalogue by name -- which is exactly what a
     bundle page is for. It carries no downloadUrl yet: the installer is
     published through the releases repository first, and the hub points at it
     only once that release exists and its checksum has been read back from the
     published file. */
  Object.freeze({
    slug: 'everything',
    name: 'StudioZIO Everything',
    shortName: 'Everything',
    manufacturer: 'StudioZIO',
    version: '1.0.2',
    platform: 'macOS',
    /* Read from the installer, not decided here: the package declares
       hostArchitectures x86_64,arm64 and a macOS 11.0 minimum, so it installs
       on an Intel Mac. Six of the seven plug-ins inside are Universal and run
       there; Tempo Delay needs Apple Silicon and macOS 12. From Everything
       1.0.2 the installer leaves Tempo Delay unselected and switched off on
       any other Mac, and the page says so. */
    architecture: 'Universal \u2014 Apple Silicon and Intel',
    formats: Object.freeze(['Audio Unit (AU)', 'VST3', 'AAX', 'Standalone']),
    compactFormats: 'AU / VST3 / AAX / Standalone',
    price: 'Free',
    availability: 'Coming soon',
    description:
      'One installer that puts all seven StudioZIO plug-ins on the machine, so there is one download and one checksum instead of seven.',
    detailsUrl: '/products/everything/'
  }),
  Object.freeze({
    slug: 'mastering-suite',
    name: 'StudioZIO Mastering Suite',
    shortName: 'Mastering Suite',
    version: '2.1.1',
    platform: 'macOS',
    /* Stated per product, not assumed. Mastering is Universal, but Tempo is arm64 only,
       and a hub that says only "macOS" sends Intel owners to a download
       that will not run. */
    architecture: 'Universal — Apple Silicon and Intel',
    formats: Object.freeze(['Audio Unit (AU)', 'VST3', 'AAX', 'Standalone']),
    compactFormats: 'AU / VST3 / AAX / Standalone',
    filename: 'StudioZIO-Mastering-Suite-2.1.1.pkg',
    downloadUrl:
      'https://github.com/StudioZIO/StudioZIO-Releases/releases/download/mastering-suite-v2.1.1-install-fix-2026.09.11/StudioZIO-Mastering-Suite-2.1.1.pkg',
    releaseUrl:
      'https://github.com/StudioZIO/StudioZIO-Releases/releases/tag/mastering-suite-v2.1.1-install-fix-2026.09.11',
    sha256:
      'b054098c4f6565e5e469efd41554425d468830a001c9d4c531e72ab8c50f4cf1',
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
    formats: Object.freeze(['Audio Unit (AU)', 'VST3', 'AAX', 'Standalone']),
    compactFormats: 'AU / VST3 / AAX / Standalone',
    price: 'Free',
    version: '4.0.1',
    filename: 'StudioZIOTempoDelay-v4.1.0-macOS-arm64.pkg',
    downloadUrl:
      'https://github.com/StudioZIO/StudioZIO-Releases/releases/download/tempo-delay-v4.1.0-clean-packaging-2026.09.16/StudioZIOTempoDelay-v4.1.0-macOS-arm64.pkg',
    releaseUrl:
      'https://github.com/StudioZIO/StudioZIO-Releases/releases/tag/tempo-delay-v4.1.0-clean-packaging-2026.09.16',
    sha256:
      'fa16f0c9f04f5f56e446ae06074a0f3b0a8e193fa21089e0bf92c486d197910d',
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
    formats: Object.freeze(['Audio Unit (AU)', 'VST3', 'AAX', 'Standalone']),
    compactFormats: 'AU / VST3 / AAX / Standalone',
    availability: 'Coming soon',
    description:
      'A modular mixing environment that brings essential processing into one focused rack.',
    detailsUrl: MIXRACK_WEBSITE,
    externalDetails: true
  }),
  /* Inflator is the first standalone single-module product, and it does not
     get its own site the way Mastering Suite, Tempo Delay and MixRack do --
     the estate decision is that the single-module products stay native to
     the hub. detailsUrl is therefore a hub route, not an external origin, and
     externalDetails is left unset so the card and the JSON-LD both read it as
     a page this site itself serves. */
  Object.freeze({
    slug: 'inflator',
    name: 'StudioZIO Inflator',
    shortName: 'Inflator',
    version: '1.0.0',
    platform: 'macOS',
    architecture: 'Universal — Apple Silicon and Intel',
    formats: Object.freeze(['Audio Unit (AU)', 'VST3', 'AAX', 'Standalone']),
    compactFormats: 'AU / VST3 / AAX / Standalone',
    filename: 'StudioZIO-Inflator-1.0.0.pkg',
    downloadUrl:
      'https://github.com/StudioZIO/StudioZIO-Releases/releases/download/inflator-v1.0.0/StudioZIO-Inflator-1.0.0.pkg',
    releaseUrl:
      'https://github.com/StudioZIO/StudioZIO-Releases/releases/tag/inflator-v1.0.0',
    sha256:
      'c138a979cb80bd04b755ab4c308a1b0dc8ccad518d6483076e2b8a3ba05fabde',
    signing: 'Developer ID signed',
    notarization: 'Apple notarized',
    price: 'Free',
    availability: 'Available now',
    description:
      'One focused harmonic-enhancement stage: dial in Amount, trim gain going in and coming out, and compare instantly with Engaged.',
    detailsUrl: '/products/inflator/'
  }),
  /* The second hub-native single-module product, and it takes Inflator's shape
     exactly: a hub route for detailsUrl, no external origin, and the full set of
     release-artifact fields that scripts/verify_downloads.mjs reads. The surface
     it exposes is three controls and three meters; that is the product's shape,
     not an unfinished one. */
  Object.freeze({
    slug: 'maximizer',
    name: 'StudioZIO Maximizer',
    shortName: 'Maximizer',
    version: '1.0.3',
    platform: 'macOS',
    architecture: 'Universal — Apple Silicon and Intel',
    formats: Object.freeze(['Audio Unit (AU)', 'VST3', 'AAX', 'Standalone']),
    compactFormats: 'AU / VST3 / AAX / Standalone',
    filename: 'StudioZIO-Maximizer-1.0.3.pkg',
    downloadUrl:
      'https://github.com/StudioZIO/StudioZIO-Releases/releases/download/maximizer-v1.0.3/StudioZIO-Maximizer-1.0.3.pkg',
    releaseUrl:
      'https://github.com/StudioZIO/StudioZIO-Releases/releases/tag/maximizer-v1.0.3',
    sha256:
      'd589be77a2d72355a86a2bd2b7d5ea70dcd9d2b5871ec61c6960e5754abecc50',
    signing: 'Developer ID signed',
    notarization: 'Apple notarized',
    price: 'Free',
    availability: 'Available now',
    description:
      'Adaptive limiting held to a strict final true-peak ceiling: set Input Gain and Ceiling, and read the cost on the meters.',
    detailsUrl: '/products/maximizer/'
  }),
  Object.freeze({
    slug: 'compressor',
    name: 'StudioZIO Compressor',
    shortName: 'Compressor',
    version: '1.0.0',
    platform: 'macOS',
    architecture: 'Universal — Apple Silicon and Intel',
    formats: Object.freeze(['Audio Unit (AU)', 'VST3', 'AAX', 'Standalone']),
    compactFormats: 'AU / VST3 / AAX / Standalone',
    filename: 'StudioZIO-Compressor-1.0.0.pkg',
    downloadUrl:
      'https://github.com/StudioZIO/StudioZIO-Releases/releases/download/compressor-v1.0.0-clean-packaging-2026.09.16/StudioZIO-Compressor-1.0.0.pkg',
    releaseUrl:
      'https://github.com/StudioZIO/StudioZIO-Releases/releases/tag/compressor-v1.0.0-clean-packaging-2026.09.16',
    sha256:
      '96c9d4cccefc918ffef47b094464da901be742778b4fc6e97145ddcfa11d37bc',
    signing: 'Developer ID signed',
    notarization: 'Apple notarized',
    price: 'Free',
    availability: 'Available now',
    description:
      'Two compression modes behind one control: Adaptive for fast transparent work, Glue for slower cohesion, with the reduction on its own meter.',
    detailsUrl: '/products/compressor/'
  }),
  Object.freeze({
    slug: 'de-esser',
    name: 'StudioZIO De-Esser',
    shortName: 'De-Esser',
    version: '1.0.0',
    platform: 'macOS',
    architecture: 'Universal \u2014 Apple Silicon and Intel',
    formats: Object.freeze(['Audio Unit (AU)', 'VST3', 'AAX', 'Standalone']),
    compactFormats: 'AU / VST3 / AAX / Standalone',
    filename: 'StudioZIO-De-Esser-1.0.0.pkg',
    downloadUrl:
      'https://github.com/StudioZIO/StudioZIO-Releases/releases/download/deesser-v1.0.0/StudioZIO-De-Esser-1.0.0.pkg',
    releaseUrl:
      'https://github.com/StudioZIO/StudioZIO-Releases/releases/tag/deesser-v1.0.0',
    sha256:
      '698a5c45dc530b97bd4fc3c9f6e401bf4cbb414a435ff1d4235f6afa66e661f2',
    signing: 'Developer ID signed',
    notarization: 'Apple notarized',
    price: 'Free',
    availability: 'Available now',
    description:
      'Two de-essing modes behind one control: Natural for a dynamic bell that targets the sibilance, Control for split-band reduction above 5 kHz, with the gain reduction on its own meter.',
    detailsUrl: '/products/de-esser/'
  })
]);

export function getProduct(slug) {
  const product = products.find((candidate) => candidate.slug === slug);
  if (!product) {
    throw new Error(`Unknown product slug: ${slug}`);
  }
  return product;
}
