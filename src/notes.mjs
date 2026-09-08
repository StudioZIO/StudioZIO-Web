/* Technical notes. These exist because the questions they answer are ones
   people actually search for, and because a claim the plug-in makes on its
   surface should be explainable somewhere that is not a marketing page.

   Each note is data rather than markup so the page shell, the build routes,
   the sitemap and the validator all read the same list and cannot drift. */

export const notes = Object.freeze([
  Object.freeze({
    slug: 'expected-true-peak',
    heading: 'Why the ceiling you set is not quite the peak you get',
    title: 'Why your ceiling is not quite your peak',
    description:
      'Set a limiter to -1.00 dBTP and the render measures -1.01. That gap is not a fault, and the reason for it is the whole job of a true-peak limiter.',
    standfirst:
      'A hundredth of a decibel nobody can hear, and the reason it is there is the same reason a master survives a codec.',
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
        h: 'Where the hundredth of a decibel comes from',
        p: Object.freeze([
          'The limiter has to guarantee the reconstructed waveform never exceeds the ceiling you set, which means predicting where the reconstructed peaks will land and reducing gain before they arrive. That is what the lookahead is for.',
          'Prediction is not exact. The limiter works on a finite-length reconstruction with a finite-length filter, and the residual is systematic rather than random: the delivered peak lands a hair away from the target, by an amount the algorithm can compute in advance.',
          'So there are two honest options. Pretend the ceiling is exact and let you find the discrepancy in an analyser. Or say what will actually come out.'
        ])
      }),
      Object.freeze({
        h: 'The readout',
        p: Object.freeze([
          'Mastering Suite shows an EXPECTED TP figure beside the ceiling. Set -1.00 dBTP and it reads approximately -1.01 dBTP, which is what the render will measure.',
          'It is a readout, not a parameter: there is nothing to turn, and switching the display off would produce a byte-identical file. It is a prediction, not a correction: the plug-in is not nudging the ceiling to make a round number come out. And it exists because the alternative is worse. A plug-in that displays -1.00 and delivers -1.01 has not done anything wrong to the audio. It has declined to tell you something it knew.'
        ])
      }),
      Object.freeze({
        h: 'What to do with it',
        p: Object.freeze([
          'For streaming delivery the practical advice has not changed: leave real headroom. Platforms transcode to lossy formats, and lossy encoding moves peaks in a direction nobody can predict from the source file. A ceiling of -1.0 dBTP is a common floor for a reason, and going further costs nothing that matters.',
          'What the readout gives you is not a new setting to chase. It is the ability to stop wondering. When a delivery spec says the file must not exceed -1.0 dBTP and your analyser says -1.01, you know that is the limiter doing what it said it would, and not a sign that something in the chain is lying to you.'
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
  })
]);

export function getNote(slug) {
  const note = notes.find((candidate) => candidate.slug === slug);
  if (!note) throw new Error(`Unknown note slug: ${slug}`);
  return note;
}
