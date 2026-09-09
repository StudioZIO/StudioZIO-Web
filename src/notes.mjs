/* Technical notes. These exist because the questions they answer are ones
   people actually search for, and because a claim the plug-in makes on its
   surface should be explainable somewhere that is not a marketing page.

   Each note is data rather than markup so the page shell, the build routes,
   the sitemap and the validator all read the same list and cannot drift. */

export const notes = Object.freeze([
  Object.freeze({
    slug: 'expected-true-peak',
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
    heading: 'Where AAX support stands',
    title: 'Where AAX support stands',
    description:
      'Both plug-ins have AAX builds that run and pass the functional tests. Neither is signed, so Pro Tools will not load them, and one validator test still fails.',
    standfirst:
      'The builds exist and behave. What is left is a signing chain that is mostly other people\'s queues, and one gap that is still code.',
    body: Object.freeze([
      Object.freeze({
        h: 'What exists',
        p: Object.freeze([
          'The most common question here is whether these plug-ins run in Pro Tools. The short answer is not yet. The useful answer is what has been built, what was measured, and what is actually left.',
          'Both plug-ins have AAX builds. Mastering Suite is a universal binary, arm64 and x86_64, against AAX SDK 2.9.0 with JUCE 8.0.4. Tempo Delay is arm64, against the same SDK.',
          'Avid\'s AAX Plug-In Validator 2024.6.0 instantiated six effect variants from each — three realtime, three AudioSuite — and every functional test passed on all of them. It enumerated 43 parameters on Mastering Suite, which is the 42 the plug-in declares plus the Master Bypass that JUCE synthesises for AAX, and 33 on Tempo Delay. Mastering Suite\'s build was re-run against current source on 6 September and every verdict came back identical.'
        ])
      }),
      Object.freeze({
        h: 'What the validator actually said',
        p: Object.freeze([
          '"Passes the validator" would be an overstatement, so here is the real result. One test fails on both plug-ins: test.page_table.load, three of six, with the three AudioSuite variants correctly skipping as offline-only.',
          'That is a real gap rather than a tooling artefact. An AAX page table maps parameters onto Avid control surfaces, and neither build ships one, which is why both score zero per cent for page tables. It does not stop the plug-in loading or running; it means no control-surface mapping on an S6 or similar. Closing it is a C++ change rather than a build setting, and it is deliberately deferred until signing works — a control surface you cannot load the plug-in on is not the first problem to solve.',
          'One more thing worth being exact about: both bundles are unwrapped and unsigned. Those runs say the plug-ins are structurally sound as AAX. They say nothing at all about whether Pro Tools would load them.'
        ])
      }),
      Object.freeze({
        h: 'The signing chain, and where it actually is',
        p: Object.freeze([
          'Every AAX plug-in that loads in a normal Pro Tools installation is wrapped by PACE, the company that provides Avid\'s plug-in security. Without that wrap Pro Tools refuses the binary, and there is no user-side setting that changes it. It is not a warning that can be clicked through.',
          'The SDK, the developer tools and the Avid account are in place, and Avid has made the referral to PACE. The application for PACE\'s code signing tools went in on 7 September and is under review. The physical iLok arrived and was registered the same day — and it does have to be the USB key: machine activation and cloud licences do not carry a signing licence, which is a detail worth knowing before you assume the iLok you already own will do.',
          'Two things are still outstanding. The wraptool licence itself, which waits on that review. And a per-product wrapping identifier, issued for each product so hosts and the security layer can tell products apart across versions and vendors.'
        ])
      }),
      Object.freeze({
        h: 'Why there is no date',
        p: Object.freeze([
          'Because the timeline is not mine. What is left waits on a review by a party who owes me nothing and has their own queue. Naming a month would mean inventing a commitment on someone else\'s behalf, and a date announced and missed does more damage than no date at all.',
          'What can be said is what is true today: both builds exist, both behave, neither is wrapped, the application is in, the page table is outstanding by choice, and the wait is the long pole. When it ships it will be free, like everything else here.'
        ])
      }),
      Object.freeze({
        h: 'What to do until then',
        p: Object.freeze([
          'If you are on Pro Tools, nothing here helps you yet, and I would rather say so than let you download an installer and find out afterwards.',
          'If you are on Logic, Live, Reaper, Studio One, Bitwig, Cubase or anything else that hosts AU or VST3 on macOS, both plug-ins are finished and free today. The AAX work adds a host; it does not change the product.',
          'And if you are a developer about to walk the same path: budget for the paperwork, and do not assume a clean validator run means you are nearly done. Read the failures.'
        ])
      })
    ])
  }),
  Object.freeze({
    slug: 'what-studiozio-is-building',
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
          'Tempo Delay is Apple Silicon only. Mastering Suite is a universal binary and runs on Intel Macs; Tempo Delay does not.',
          'No Pro Tools support yet. Both plug-ins have AAX builds that pass every functional test in Avid\'s validator except its control-surface page table, but neither is signed, and an unsigned AAX plug-in will not load in a normal Pro Tools installation — that needs a PACE signing chain which is a separate commercial process, currently under review. There is no date, and the reasons are in a note of their own.',
          'Stating these plainly costs some downloads. It costs fewer than a bad first five minutes does, and a free plug-in has nothing to sell except whether you trust what it tells you.'
        ])
      }),
      Object.freeze({
        h: 'No account, no iLok, no email registration',
        p: Object.freeze([
          'The installer is a signed and notarised package. You download it, you run it, the plug-in is there. Nothing to activate, no address to hand over, no licence manager, nothing that expires or phones home.',
          'Formats are Audio Unit, VST3 and Standalone for both products.'
        ])
      }),
      Object.freeze({
        h: 'The three',
        p: Object.freeze([
          'StudioZIO Mastering Suite 2.1.1 is the nine-stage mastering console described above. Universal binary, macOS 11 or newer.',
          'StudioZIO Tempo Delay 4.0.1 is a tempo-synced stereo delay whose left and right delay lines are genuinely independent, each with its own buffer and its own note division, so the two sides can sit on different rhythmic values against one tempo. Ping-pong routing, filters and soft-clip saturation inside the feedback loop, three character voicings, LFO modulation, ducking, mid/side width. 32 automatable parameters with stable identifiers, and 0 samples of reported latency. Apple Silicon only, macOS 12 or newer.',
          'StudioZIO MixRack is a modular mixing environment bringing essential processing into one focused rack. In development, with no release date and nothing to download. It is named here because it exists, not because it is close.',
          'Three focused instruments, not a bundle. Each one does a job you can name.'
        ])
      })
    ])
  }),
  Object.freeze({
    slug: 'two-delay-lines-not-one',
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
    heading: 'What lives inside the feedback loop',
    title: 'What lives inside the feedback loop',
    description:
      'A filter inside a delay’s feedback path is applied again on every repeat. That compounding is the difference between a delay that darkens and one that is just dull.',
    standfirst:
      'The same filter setting is gentle on the first repeat and drastic by the eighth. That is not a fault. It is what inside the loop means.',
    body: Object.freeze([
      Object.freeze({
        h: 'Inside and after are different places',
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
