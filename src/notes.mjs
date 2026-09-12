/* Technical notes. These exist because the questions they answer are ones
   people actually search for, and because a claim the plug-in makes on its
   surface should be explainable somewhere that is not a marketing page.

   Each note is data rather than markup so the page shell, the build routes,
   the sitemap and the validator all read the same list and cannot drift. */

/* Every note carries the day it went onto the site. The dates were read from
   this file's own history rather than chosen: the library was published in
   one go on 11 September 2026. They are written out here rather than derived
   at build time so the build never depends on git, and so a wrong one can be
   corrected on its own line.

   The feed, the sitemap's lastmod and each note's structured data all read
   this field, so they cannot disagree about when a note appeared. */
export const notes = Object.freeze([
  Object.freeze({
    slug: 'aax-is-now-live',
    published: '2026-09-11',
    heading: 'AAX is now live',
    title: 'AAX is now live',
    description:
      'AAX is now available for StudioZIO Mastering Suite 2.1.1 and Tempo Delay 4.0.1, with both releases validated in Pro Tools.',
    standfirst:
      'AAX is now available for Mastering Suite and Tempo Delay, with both releases validated in Pro Tools.',
    body: Object.freeze([
      Object.freeze({
        h: 'What shipped',
        p: Object.freeze([
          'AAX is now available for both current StudioZIO products. This is not a separate experimental branch or an invite-only beta. The AAX targets have been integrated into the standard build pipeline and merged into the primary release distribution.',
          'When you download and run the official macOS installer, it deploys an AAX plug-in bundle directly to the standard Avid plug-in directory alongside the Audio Unit, VST3, and Standalone outputs.'
        ])
      }),
      Object.freeze({
        h: 'Mastering Suite 2.1.1',
        p: Object.freeze([
          'Mastering Suite 2.1.1 is distributed across four distinct outputs: AU, VST3, AAX, and a Standalone application.',
          'The release is a Universal macOS build, containing native executable slices for both Apple Silicon (arm64) and Intel (x86_64). It runs natively on current Apple Silicon hardware while preserving complete compatibility with Intel-based workstations.'
        ])
      }),
      Object.freeze({
        h: 'Tempo Delay 4.0.1',
        p: Object.freeze([
          'Tempo Delay 4.0.1 is similarly distributed as AU, VST3, AAX, and a Standalone application.',
          'Unlike Mastering Suite, the DSP executable for Tempo Delay is compiled exclusively for Apple Silicon (arm64). There is no Intel build. That architectural boundary remains identical to prior releases.'
        ])
      }),
      Object.freeze({
        h: 'Pro Tools validation',
        p: Object.freeze([
          'Producing an AAX binary and confirming that a host loads and runs it reliably are two separate engineering facts. Both releases have been directly tested and validated in Pro Tools.',
          'Validation covers realtime audio processing, automation parameter mapping, and offline session state recall. As documented in <a href="/notes/where-aax-support-stands/">Where AAX support stands</a>, AAX plug-ins require PACE signing to be recognized by Pro Tools. However, neither release requires an iLok account, dongle, or user registration.',
          'For more details on host testing boundaries, see <a href="/notes/what-we-mean-by-studiozio-verified/">What we mean by StudioZIO Verified</a>.'
        ])
      })
    ])
  }),
  Object.freeze({
    slug: 'what-we-mean-by-studiozio-verified',
    published: '2026-09-11',
    heading: 'What we mean by StudioZIO Verified',
    title: 'What we mean by StudioZIO Verified',
    description:
      'Compatible is not the same as directly tested. StudioZIO Verified marks the host environments for which we have direct test evidence.',
    standfirst:
      'Compatible is not the same as directly tested. StudioZIO Verified marks the host environments for which we have direct test evidence.',
    body: Object.freeze([
      Object.freeze({
        h: 'Format compliance versus host testing',
        p: Object.freeze([
          'Audio plug-in formats are defined by formal specifications. A plug-in that passes the Audio Unit validation utility, the VST3 validator, or the AAX validator satisfies the structural requirements of the format. In theory, any conforming host should load it seamlessly.',
          'In practice, every digital audio workstation implements host-side scheduling, process threading, buffer resizing, and UI hosting differently. Format compliance establishes that a plug-in conforms to the API specification; it does not guarantee how a specific host interacts with it under session load.'
        ])
      }),
      Object.freeze({
        h: 'The StudioZIO Verified standard',
        p: Object.freeze([
          'On our compatibility surfaces, a host marked with the StudioZIO Verified badge indicates that we have direct, firsthand test evidence for that specific environment.',
          'Currently, REAPER, Logic Pro, and Pro Tools are StudioZIO Verified. For these hosts, we have executed repeatable test suites covering audio thread stability, sample rate transitions from 44.1 kHz to 192 kHz, parameter automation recording and playback, state persistence across session saves, and bypass switching.'
        ])
      }),
      Object.freeze({
        h: 'What the label does not claim',
        p: Object.freeze([
          'StudioZIO Verified is a statement of our own internal testing. It is not a vendor endorsement or official certification. For instance, our AAX validation in Pro Tools reflects our test passes; it is not an Avid Certified designation.',
          'It also does not claim that every point release or historical version of a DAW behaves identically. Testing is conducted on current modern releases on macOS.'
        ])
      }),
      Object.freeze({
        h: 'Unverified is not incompatible',
        p: Object.freeze([
          'Hosts that do not carry the StudioZIO Verified mark, such as Ableton Live, Bitwig Studio, or Cubase, are not incompatible. Because our plug-ins adhere strictly to the AUv2 and VST3 standards, they generally run without issue in conforming DAWs.',
          'However, we do not apply the verified status until we have completed and documented explicit test protocols in-house. To review current test status or report community host findings, visit the <a href="/community/compatibility/">Community Compatibility</a> page.'
        ])
      })
    ])
  }),
  Object.freeze({
    slug: 'why-release-truth-starts-with-the-artifact',
    published: '2026-09-11',
    heading: 'Why release truth starts with the artifact',
    title: 'Why release truth starts with the artifact',
    description:
      'Formats and architectures are derived from the final shipped artifact, not filenames, summaries or assumptions.',
    standfirst:
      'Formats and architectures are derived from the final shipped artifact, not filenames, summaries or assumptions.',
    body: Object.freeze([
      Object.freeze({
        h: 'The risk of assumption',
        p: Object.freeze([
          'In software distribution, documentation and marketing copy frequently drift away from the compiled reality. A build configuration might specify an architecture target, a release note might abbreviate the format list, or an installer filename might inherit a legacy naming convention.',
          'When public documentation relies on build scripts or filenames rather than inspectable binaries, inaccuracies accumulate. An abbreviated summary might omit the Standalone application, or a package name might suggest a single architecture when the binaries inside are universal.'
        ])
      }),
      Object.freeze({
        h: 'Inspecting the final payload',
        p: Object.freeze([
          'At StudioZIO, public capability claims must derive directly from the final, immutable release artifact. Before a release is approved for publication, the signed and notarized package is downloaded and expanded in a clean, read-only inspection environment.',
          'We inventory the exact payloads installed to disk across four capability targets: Audio Unit (.component), VST3 (.vst3), AAX (.aaxplugin), and the Standalone application (.app). If an output does not exist in the expanded payload, it cannot be claimed on any public surface.'
        ])
      }),
      Object.freeze({
        h: 'Binary architecture inspection',
        p: Object.freeze([
          'Payload presence is only half the verification. Each contained executable is inspected directly using Mach-O analysis tools like lipo and file.',
          'This establishes whether each binary contains arm64 slices, x86_64 slices, or both. We never infer architecture from the installer filename. If the binaries are universal, the release is universal, even if the installer package filename contains an arm64 token for historical reasons.'
        ])
      }),
      Object.freeze({
        h: 'The Release Truth Manifest',
        p: Object.freeze([
          'The results of this inspection are recorded in a permanent, version-controlled Release Truth Manifest. Downstream web pages, product catalogs, and release notes must read their capability claims from this manifest rather than manual transcription.',
          'To see how this applies to our current lineup, read <a href="/notes/universal-vs-apple-silicon-what-actually-ships/">Universal vs Apple Silicon</a>, or review the overall workflow in <a href="/notes/inside-the-studiozio-release-pipeline/">Inside the StudioZIO release pipeline</a>.'
        ])
      })
    ])
  }),
  Object.freeze({
    slug: 'universal-vs-apple-silicon-what-actually-ships',
    published: '2026-09-11',
    heading: 'Universal vs Apple Silicon: what actually ships',
    title: 'Universal vs Apple Silicon: what actually ships',
    description:
      'Mastering Suite ships Universal. Tempo Delay is Apple Silicon only. The difference comes from the binaries, not the installer name.',
    standfirst:
      'Mastering Suite ships Universal. Tempo Delay is Apple Silicon only. The difference comes from the binaries, not the installer name.',
    body: Object.freeze([
      Object.freeze({
        h: 'What the terms mean',
        p: Object.freeze([
          'On macOS, an executable file can contain machine code for more than one CPU architecture. A binary containing both Apple Silicon (arm64) and Intel (x86_64) slices is a Universal binary. The operating system loads the native slice matching the host machine automatically.',
          'By contrast, an Apple Silicon-only binary contains only arm64 instructions. It executes natively on Apple Silicon Macs, but will not load on Intel hardware.'
        ])
      }),
      Object.freeze({
        h: 'Mastering Suite 2.1.1 is Universal',
        p: Object.freeze([
          'Every component of <a href="https://studioziomasteringsuite.vercel.app/">StudioZIO Mastering Suite</a> 2.1.1 is built as a Universal binary. Whether you load the AUv2, VST3, AAX, or Standalone application, the binary contains dual architecture slices: arm64 and x86_64.',
          'This means Mastering Suite runs without translation on Apple Silicon and provides native performance on legacy Intel systems on macOS 11 or higher.'
        ])
      }),
      Object.freeze({
        h: 'Tempo Delay 4.0.1 is Apple Silicon only',
        p: Object.freeze([
          '<a href="https://www.tempodelay.tech/">StudioZIO Tempo Delay</a> 4.0.1 is compiled specifically for Apple Silicon (arm64). All four outputs (AU, VST3, AAX, and Standalone) contain exclusively arm64 code.',
          'There is no Intel slice in the executable, and it will not run on Intel Macs. Stating this limit plainly ensures users on Intel systems do not download an installer that cannot run in their environment.'
        ])
      }),
      Object.freeze({
        h: 'Filenames are not architecture evidence',
        /* The question underneath the whole note is "will this run on my
           Mac", so the figure asks that and answers it from the slices. */
        figure: 'binary-architecture',
        p: Object.freeze([
          'A Mastering Suite 2.1.1 installer published in September 2026 was named StudioZIO-Mastering-Suite-v2.1.1-macOS-arm64.pkg. That name arose during build orchestration, but binary analysis showed every payload inside to be a dual-slice Universal binary.',
          'Because published release artifacts are immutable, we did not rename or repackage a verified, notarized installer merely to alter a cosmetic label. The current installer is named StudioZIO-Mastering-Suite-2.1.1.pkg, the name the release pipeline emits. Either way, the architecture truth comes from the binaries within the payload, verified directly during release inspection.'
        ])
      })
    ])
  }),
  Object.freeze({
    slug: 'inside-the-studiozio-release-pipeline',
    published: '2026-09-11',
    heading: 'Inside the StudioZIO release pipeline',
    title: 'Inside the StudioZIO release pipeline',
    description:
      'From frozen artifact to live release: inspection, manifests, signing, validation, CI and public verification.',
    standfirst:
      'From frozen artifact to live release: inspection, manifests, signing, validation, CI and public verification.',
    body: Object.freeze([
      Object.freeze({
        h: 'From candidate to frozen artifact',
        p: Object.freeze([
          'A release begins when a build candidate successfully clears compilation, static analysis, and local host testing. At this point, the build artifacts are packaged into the final macOS installer .pkg format and cryptographically frozen.',
          'The installer SHA-256 hash is computed immediately. From this second forward, the artifact is immutable: no byte changes, repackaging, or re-signing are permitted without restarting the release cycle.'
        ])
      }),
      Object.freeze({
        h: 'Inspection and manifest generation',
        p: Object.freeze([
          'Before any public repository or website is updated, the frozen installer is unpacked in a sandbox environment. Each output bundle is checked for presence and code integrity.',
          'Binary analysis verifies architecture slices across all formats. Apple notarization tickets and Developer ID signatures are validated. The confirmed findings are written to a Release Truth Manifest in the release repository, creating an auditable record of the exact binaries shipped.'
        ])
      }),
      Object.freeze({
        h: 'Automated CI and checksum gates',
        p: Object.freeze([
          'Once the manifest is committed, downstream properties synchronize. The catalog entries and product pages derive their version numbers, format badges, and architecture claims from the manifest.',
          'Our continuous integration pipeline validates structural integrity, executes automated tests across our <a href="/products/">product catalog</a>, and downloads the public release assets from GitHub to verify that live bytes match the registered SHA-256 checksums exactly.'
        ])
      }),
      Object.freeze({
        h: 'Rendered DOM and public cutover',
        p: Object.freeze([
          'The final gate occurs in the browser. Headless Chromium testing verifies that rendered pages on both desktop and mobile viewports display coherent typography, correct host support tags, and zero contradictory text.',
          'Only after the live site, download mirrors, and third-party listings on KVR reflect verified truth is the release considered complete. For details on verified DAWs, consult <a href="/community/compatibility/">Compatibility</a>.'
        ])
      })
    ])
  }),
  Object.freeze({
    slug: 'expected-true-peak',
    published: '2026-09-11',
    heading: 'What EXPECTED TP tells you',
    title: 'EXPECTED TP is not an output measurement',
    description:
      'EXPECTED TP is a value derived from the ceiling setting, not a measurement of the rendered audio. Verify delivery with an output meter.',
    standfirst:
      'A useful ceiling-derived reference, provided it is not confused with a true-peak measurement of your audio.',
    body: Object.freeze([
      Object.freeze({
        h: 'Sample peak is not the peak',
        p: Object.freeze([
          'A digital file is a list of numbers: the level at one instant, tens of thousands of times a second. A sample-peak meter reports the largest of those numbers, which is a fact you can verify by reading the file.',
          'But nobody listens to a list of numbers. A converter has to draw a continuous waveform back through those points, and the curve it draws does not stay inside them. Between two samples that both sit at -1 dB, the reconstructed waveform can arc above both. That arc is real signal. It leaves the converter, and if it goes above 0 dB something downstream clips, even though every number in the file was below the line.'
        ])
      }),
      Object.freeze({
        h: 'How true peak is measured',
        p: Object.freeze([
          'You cannot see between two samples by looking harder at them. You have to reconstruct the curve, and to reconstruct it you make more samples: upsample, look at the denser version, take the peak of that.',
          'How much denser matters. ITU-R BS.1770 specifies a minimum of 4x oversampling for true-peak measurement. Four times catches most inter-sample peaks but still under-reads, because the true maximum can sit between two of the new samples too. Mastering Suite measures at 16x with a 512-tap-per-phase polyphase filter, which is a deliberately expensive choice for a measurement that only has to be right rather than fast.'
        ])
      }),
      Object.freeze({
        h: 'A reference, not a reading',
        /* The distinction this whole note exists to make, as two dials: the
           ceiling moves the readout, the programme does not. */
        figure: 'expected-tp-derivation',
        p: Object.freeze([
          'EXPECTED TP is calculated from the ceiling setting with a fixed 0.01 dB allowance. It helps make that configured relationship visible in the interface.',
          'It does not inspect the music passing through the plug-in. It cannot replace a meter on the actual output, and it does not predict or guarantee the measured true peak of a rendered, encoded, or exported file.'
        ])
      }),
      Object.freeze({
        h: 'The readout',
        p: Object.freeze([
          'Mastering Suite shows an EXPECTED TP figure beside the ceiling. It is derived from the ceiling setting with a fixed 0.01 dB allowance; it is not a measurement of the audio output and it does not guarantee the true peak of a rendered, encoded, or exported file.',
          'It is a readout, not a parameter: there is nothing to turn, and switching the display off produces a byte-identical file. It is not a correction or an output meter. Use a true-peak meter on the rendered file when a delivery specification requires a measured limit.'
        ])
      }),
      Object.freeze({
        h: 'What to do with it',
        p: Object.freeze([
          'For streaming delivery the practical advice has not changed: leave real headroom. Platforms transcode to lossy formats, and lossy encoding can move peaks in ways that cannot be inferred from the source file. A ceiling of -1.0 dBTP is a common starting point.',
          'EXPECTED TP is not a new target to chase. Treat it as a clear indication of the configured ceiling relationship, then use a true-peak meter on the actual output and exported file when compliance matters.'
        ])
      })
    ])
  }),
  Object.freeze({
    slug: 'oversampling-is-not-one-switch',
    published: '2026-09-11',
    heading: 'Oversampling is not one switch',
    title: 'Oversampling is not one switch',
    description:
      'Most plug-ins offer one oversampling control for everything inside. Different stages need different amounts, and the highest setting is not the careful choice.',
    standfirst:
      'A per-stage engineering decision, dressed up in most plug-ins as a quality dial you turn until the processor runs out.',
    body: Object.freeze([
      Object.freeze({
        h: 'What oversampling actually fixes',
        p: Object.freeze([
          'Any non-linear process — saturation, hard-knee compression, clipping of any kind — generates frequency content that was not in the input. For saturation that is the entire point; the harmonics are the sound.',
          'The problem is where they land. A 15 kHz input through a stage generating a third harmonic wants to produce 45 kHz. At a 48 kHz sample rate there is nowhere to put it: anything above 24 kHz folds back down and reappears in the audible band at a frequency with no musical relationship to what you played. That is aliasing, and it is the brittle, metallic quality that makes a bad saturator sound bad.',
          'Oversampling gives the harmonics somewhere to go. Run the stage at 4x and there is room up to 96 kHz: generate the harmonics there, filter above the original limit, come back down.'
        ])
      }),
      Object.freeze({
        h: 'Why one number cannot be right for every stage',
        p: Object.freeze([
          'How much room a stage needs depends on how much new content it makes and how high it reaches. Gentle saturation with a smooth transfer curve produces harmonics that fall away quickly, and modest oversampling covers it.',
          'A hard clipper is the opposite. A hard corner in the transfer function generates harmonics that decay very slowly, and mathematically the series does not terminate at all. There is no ratio that removes every alias from a true hard clip; you pick one where the residue is below anything that matters, and you handle the corner itself separately.',
          'Those two stages sit in the same plug-in with requirements that differ by a factor of four or more. One global switch has to be wrong for at least one of them. Set it to what the clipper needs and the saturation stage burns processor for margin it will never use. Set it to what the saturation needs and the clipper aliases.'
        ])
      }),
      Object.freeze({
        h: 'Nine stages, nine answers',
        /* The figure belongs to this section because this is where the four
           rates are named. It draws what the paragraphs say and adds nothing:
           the ticks under each stage are that stage's rate, so 16x reads as
           four times denser than 4x rather than as a bigger number. */
        figure: 'per-stage-oversampling',
        p: Object.freeze([
          'Saturation runs at 4x with antiderivative anti-aliasing. The ADAA part matters more than the ratio: rather than pushing aliasing up and filtering it, ADAA changes how the non-linearity is evaluated so that far less is produced in the first place. That is why 4x is enough here rather than 16x.',
          'Soft clipping runs at a fixed 16x. Fixed, not user-selectable — this stage generates the widest harmonic spread in the plug-in, and exposing a control that lets someone set it too low would be offering a choice with only one correct answer.',
          'Hard clipping is exact-threshold, on a fixed 8x path, with polyBLAMP transition correction. The corner is handled by correcting the transition itself rather than asking oversampling alone to clean up afterwards. Correcting the discontinuity and then oversampling costs far less than oversampling enough to make an uncorrected corner acceptable.',
          'True-peak detection runs at 16x with 512 taps per phase. That one is not shaping the audio at all; it only has to be right.'
        ])
      }),
      Object.freeze({
        h: 'Which is why there is no dial to turn',
        p: Object.freeze([
          'Mastering Suite has no oversampling quality control. Each stage runs at a fixed, separately validated factor — saturation 4x, soft clipping 16x, hard clipping 8x with polyBLAMP correction, true-peak detection 16x — and none of them is selectable. For each stage there is one right answer, and offering a wrong one is not a feature.',
          'An OVERSAMPLE setting does survive in the plug-in, and it is a leftover: it is kept so that sessions saved before the per-stage architecture still load, and it no longer affects processing at all. The status bar states the factors that are actually running, which is the number worth reading.',
          'That is the argument, sitting in a control that does nothing. A quality dial is a question handed back to the person who bought the plug-in to avoid having to answer it. Answering it once per stage, and then reporting the answer, is the more useful thing to ship.'
        ])
      })
    ])
  }),
  Object.freeze({
    slug: 'where-aax-support-stands',
    published: '2026-09-11',
    heading: 'Where AAX support stands',
    title: 'AAX is now available',
    description:
      'Both plug-ins are now available as AAX and validated in Pro Tools. This note preserves the historical explanation of the signing and validation path they took.',
    standfirst:
      'AAX support is now fully available. This is the history of what the signing and validation path took.',
    body: Object.freeze([
      Object.freeze({
        h: 'AAX is now available',
        p: Object.freeze([
          'The most common question here used to be whether these plug-ins run in Pro Tools. The answer is now yes. Both StudioZIO Mastering Suite and StudioZIO Tempo Delay include AAX builds that are validated in Pro Tools.',
          'The remainder of this note preserves the historical state of the AAX builds during their development.'
        ])
      }),
      Object.freeze({
        h: 'What existed before release',
        p: Object.freeze([
          'Both plug-ins had AAX builds early on. Mastering Suite was a universal binary, arm64 and x86_64, against AAX SDK 2.9.0 with JUCE 8.0.4. Tempo Delay was arm64, against the same SDK.',
          'Avid\'s AAX Plug-In Validator 2024.6.0 instantiated six effect variants from each — three realtime, three AudioSuite — and every functional test passed on all of them. It enumerated 43 parameters on Mastering Suite, which is the 42 the plug-in declares plus the Master Bypass that JUCE synthesises for AAX, and 33 on Tempo Delay.'
        ])
      }),
      Object.freeze({
        h: 'What the validator actually said',
        p: Object.freeze([
          '"Passes the validator" would be an overstatement, so here is the real historical result. One test failed on both plug-ins: test.page_table.load, three of six, with the three AudioSuite variants correctly skipping as offline-only.',
          'That was a real gap rather than a tooling artefact. An AAX page table maps parameters onto Avid control surfaces, and neither build shipped one, which is why both scored zero per cent for page tables. It did not stop the plug-in loading or running; it meant no control-surface mapping on an S6 or similar.',
          'One more thing worth being exact about: both bundles were initially unwrapped and unsigned. Those runs said the plug-ins were structurally sound as AAX. They said nothing at all about whether Pro Tools would load them.'
        ])
      }),
      Object.freeze({
        h: 'The signing chain',
        p: Object.freeze([
          'Every AAX plug-in that loads in a normal Pro Tools installation is wrapped by PACE, the company that provides Avid\'s plug-in security. Without that wrap Pro Tools refuses the binary, and there is no user-side setting that changes it. It is not a warning that can be clicked through.',
          'The SDK, the developer tools and the Avid account were put in place, and PACE returned the next requirements. The physical iLok was registered; the remaining prerequisites were the wraptool licence, the product signing licence and a WCGUID for each product. Until those arrived, the AAX bundles remained unsigned and Pro Tools would not load them normally.'
        ])
      })
    ])
  }),
  Object.freeze({
    slug: 'what-studiozio-is-building',
    published: '2026-09-11',
    heading: 'What StudioZIO is building',
    title: 'What these plug-ins are and are not',
    description:
      'Three focused macOS plug-ins, free, with no account and no registration, and the reasoning behind the way each one is laid out and what it refuses to hide.',
    standfirst:
      'One person, two finished plug-ins and a third in development, with the limits stated before the download rather than after it.',
    body: Object.freeze([
      Object.freeze({
        h: 'The shared idea',
        p: Object.freeze([
          'Every StudioZIO plug-in is laid out in the order the audio takes. That sounds like an interface preference. It is closer to an argument.',
          'Most processing chains are presented as a set of features — a panel of modules, a rack of slots, tabs across the top — and the order they run in is either hidden, or configurable, or simply not the point. The result is that you can operate the thing for months without being able to say what happens first.',
          'Mastering Suite puts the nine stages on a rail in signal order: mid/side engine, saturation, Pink Match, VCA glue compressor, maximizer, three-band tone EQ, clipper, lookahead true-peak limiter, output. One stage is open at a time. The rail does not reorder, because the order is the design. When something sounds wrong, knowing where you are in the chain is most of the diagnosis.'
        ])
      }),
      Object.freeze({
        h: 'Measurement is not a separate product',
        p: Object.freeze([
          'The meter column stays visible no matter which stage you have open: integrated and short-term loudness, loudness range, crest factor, true peak per channel, stereo correlation.',
          'This is not a feature-list item, it is a position about how these tools should work. The industry norm is that you process in one plug-in and measure in another, which means the moment you make a change and the moment you find out what it did are separated by a window switch. Putting the measurement next to the control is not generosity; it is the only arrangement in which you can learn what the control does.',
          'The same principle produces the smaller decisions. EXPECTED TP is a ceiling-derived estimate, not a measurement of the rendered audio or a guarantee of its delivered peak. Stage rates are fixed per stage; the legacy Oversampling control remains only for older session recall and does not alter processing in 2.1.1. In both cases the plug-in knows something, and the choice is whether to say it.'
        ])
      }),
      Object.freeze({
        h: 'Naming the limits',
        p: Object.freeze([
          'macOS only. There is no build for any other platform and no timeline for one. If that is a problem, it is better to find out here than after a download.',
          'Mastering Suite is Universal (Apple Silicon and Intel). Tempo Delay is Apple Silicon (arm64) only.',
          'Stating these plainly costs some downloads. It costs fewer than a bad first five minutes does, and a free plug-in has nothing to sell except whether you trust what it tells you.'
        ])
      }),
      Object.freeze({
        h: 'No account, no iLok, no email registration',
        p: Object.freeze([
          'The installer is a signed and notarised package. You download it, you run it, the plug-in is there. Nothing to activate, no address to hand over, no licence manager, nothing that expires or phones home.',
          'Formats are Audio Unit, VST3, AAX and Standalone for both products.'
        ])
      }),
      Object.freeze({
        h: 'The three',
        p: Object.freeze([
          'StudioZIO Mastering Suite 2.1.1 is the nine-stage mastering console described above. Universal — Apple Silicon and Intel, macOS 11 or newer.',
          'StudioZIO Tempo Delay 4.0.1 is a tempo-synced stereo delay whose left and right delay lines are genuinely independent, each with its own buffer and its own note division, so the two sides can sit on different rhythmic values against one tempo. Ping-pong routing, filters and soft-clip saturation inside the feedback loop, three character voicings, LFO modulation, ducking, mid/side width. 32 automatable parameters with stable identifiers, and 0 samples of reported latency. Apple Silicon only, macOS 12 or newer.',
          'StudioZIO MixRack is a modular mixing environment bringing essential processing into one focused rack. In development, with no release date and nothing to download. It is named here because it exists, not because it is close.',
          'Three focused instruments, not a bundle. Each one does a job you can name.'
        ])
      })
    ])
  }),
  Object.freeze({
    slug: 'two-delay-lines-not-one',
    published: '2026-09-11',
    heading: 'Two delay lines, not one delay with a spread control',
    title: 'Two delay lines, not one with a spread',
    description:
      'Most stereo delays are a single delay time with an offset dialled around it. Two genuinely independent lines is a different instrument, not a wider one.',
    standfirst:
      'Put a quarter note on the left against a dotted eighth on the right and what you get is a pattern, not a widening effect.',
    body: Object.freeze([
      Object.freeze({
        h: 'What most stereo delays actually are',
        p: Object.freeze([
          'Open almost any stereo delay and you will find one delay time and a control that pushes the two sides apart from it — spread, offset, stereo, whatever it is called. The two channels are locked together and the stereo image comes from the difference you dial in around a single value.',
          'That is a good design for what it does. It widens. It cannot produce a rhythm, because both sides are still counting the same subdivision.'
        ])
      }),
      Object.freeze({
        h: 'What two lines gives you instead',
        /* The three-against-four this paragraph describes, worked out rather
           than asserted: pick the two divisions and the figure says when the
           lines meet again. */
        figure: 'two-delay-lines',
        p: Object.freeze([
          'Tempo Delay decouples them. The left and the right each have their own note division — sixteen per channel, straight, dotted and triplet — or their own free time anywhere from 1 to 5000 milliseconds, and their own feedback amount.',
          'A quarter on one side against a dotted eighth on the other is a three-against-four figure that drifts out of phase and back into alignment on a cycle you can hear. That is not a wider version of a delay. It is a different thing arriving on the same track.'
        ])
      }),
      Object.freeze({
        h: 'Why this is not just two mono delays',
        p: Object.freeze([
          'You could put a mono delay on each side of a split and get two independent times. What you would not get is the two of them talking to each other, or a way to treat the result as one image.',
          'The ping-pong toggle swaps the feedback matrix from parallel repeats to cross-channel ones, so each line feeds the other and a single tap walks across the field. And a mid/side width matrix from 0 to 200 per cent sits after the whole thing, so the result can be collapsed to mono or opened out as one decision rather than two.'
        ])
      }),
      Object.freeze({
        h: 'Where it stops being useful',
        p: Object.freeze([
          'Two uncorrelated repeat trains at high feedback stop being a rhythm quite quickly. Each side is producing its own series, the two series do not line up, and past a certain density the ear gives up on counting and hears a wash instead.',
          'The settings that keep the effect legible usually have one side carrying more feedback than the other, so there is a dominant pulse and a second one commenting on it. That is a musical judgement rather than a rule, but it is the one worth starting from.'
        ])
      })
    ])
  }),
  Object.freeze({
    slug: 'inside-the-feedback-loop',
    published: '2026-09-11',
    heading: 'What lives inside the feedback loop',
    title: 'What lives inside the feedback loop',
    description:
      'A filter inside a delay’s feedback path is applied again on every repeat. That compounding is the difference between a delay that darkens and one that is just dull.',
    standfirst:
      'The same filter setting is gentle on the first repeat and drastic by the eighth. That is not a fault. It is what inside the loop means.',
    body: Object.freeze([
      Object.freeze({
        h: 'Inside and after are different places',
        /* The difference this paragraph describes is a count, so the figure
           counts: after the delay is one pass per repeat, inside the loop is
           n passes on repeat n. */
        figure: 'feedback-loop',
        p: Object.freeze([
          'A filter placed after a delay touches every repeat exactly once. The tail gets darker than the source, and it stays that darkness all the way down.',
          'A filter placed inside the feedback path is a different arrangement. Every pass through the loop goes through it again. Six repeats through a low-pass is that low-pass applied six times, and the last repeat is not a little darker than the first — it is somewhere else entirely.'
        ])
      }),
      Object.freeze({
        h: 'What Tempo Delay puts in there',
        p: Object.freeze([
          'A 12 dB per octave high-pass and a 12 dB per octave low-pass, each sweepable across the full 20 Hz to 20 kHz range, and a soft-clipping saturation stage. All three sit inside the feedback path rather than after it.',
          'So the repeats are carved again as they decay, and driven again as they decay. The tail does not just get quieter; it moves.'
        ])
      }),
      Object.freeze({
        h: 'Why that is the right place for them',
        p: Object.freeze([
          'Because it is where they were on the machines this kind of effect is descended from. Tape lost high frequencies on every pass because the tape was in the loop. Bucket-brigade delays lost bandwidth the same way, for the same structural reason. The characteristic sound of those units is not a filter setting, it is a filter applied repeatedly.',
          'The three character voicings are that same idea packaged: Digital keeps full bandwidth and stays transparent, Tape is warmer through the top with musical saturation, Analog is darker with stronger colouration. They are not equaliser presets sitting after the delay. They change what the loop does to the signal each time round.'
        ])
      }),
      Object.freeze({
        h: 'The practical consequence: small moves',
        p: Object.freeze([
          'Because the effect compounds with repeat count, a filter setting that sounds mild on the first repeat can be the dominant character by the sixth. The instinct to turn it further because "it is barely doing anything" is usually wrong, and the evidence arrives four repeats later.',
          'The other thing to know is that filtering inside a loop also changes how much energy survives each pass. The same feedback number decays at very different rates depending on where the filters are set, so the two controls are not independent even though they look it. Narrow the band and the tail shortens without you touching feedback.'
        ])
      })
    ])
  }),
  Object.freeze({
    slug: 'zero-reported-latency',
    published: '2026-09-11',
    heading: 'Zero reported latency, and what it does not mean',
    title: 'What zero reported latency means',
    description:
      'A delay reporting zero latency is not a delay with no delay. It means the host has nothing to compensate for, which is a narrower and more useful claim.',
    standfirst:
      'The delay is still delayed. The number is about what the host has to move, not about what you hear.',
    body: Object.freeze([
      Object.freeze({
        h: 'What the number actually is',
        p: Object.freeze([
          'Every plug-in tells the host how many samples it holds the signal up before anything comes out the other side. Lookahead limiters hold up a few milliseconds so they can see a peak coming. Linear-phase equalisers hold up rather more. Oversampled processes hold up whatever their filters cost.',
          'The host takes that number and delays every other track by the same amount, so nothing drifts out of alignment. That is delay compensation, and the number driving it is a report rather than a setting. The plug-in states it; the host acts on it.'
        ])
      }),
      Object.freeze({
        h: 'Why a delay can honestly report zero',
        p: Object.freeze([
          'The obvious objection is that a delay is made of delay. But the wet signal being late is the effect, not latency: it is what you asked for, and moving the whole track to compensate for it would undo the thing you wanted.',
          'What matters for compensation is whether the plug-in holds the signal up before producing any output at all. Tempo Delay does not. What arrives in a block leaves in that block, and it reports 0 samples.'
        ])
      }),
      Object.freeze({
        h: 'Why it changes where you can put it',
        /* The claim is about what the host has to move, so the figure is the
           host: pick a reported latency and watch the other track shift. */
        figure: 'reported-latency',
        p: Object.freeze([
          'A plug-in that reports latency makes the host shift things. In a well-behaved session that is invisible and correct. It stops being invisible on parallel paths — a send running alongside the dry signal, a duplicated track, a bus feeding another bus — where the compensation has to be right on both branches for the two to stay in phase.',
          'Anything reporting zero sidesteps that question entirely. It can go on a send, in parallel with the dry, or in the middle of a chain, and nothing moves because of it.'
        ])
      }),
      Object.freeze({
        h: 'What the claim does not cover',
        p: Object.freeze([
          'It says nothing about the rest of your chain. Put a lookahead limiter after it and that limiter still reports its own latency and the host still compensates for that.',
          'It is also not a statement about processing cost. Latency and CPU are unrelated: a plug-in can be expensive and report zero, or cheap and report thousands of samples. It is one number, about one plug-in, and here it is zero.'
        ])
      })
    ])
  })
]);

export function getNote(slug) {
  const note = notes.find((candidate) => candidate.slug === slug);
  if (!note) throw new Error(`Unknown note slug: ${slug}`);
  return note;
}
