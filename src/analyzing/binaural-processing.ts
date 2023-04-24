import { BinauralSamples } from './binaural-samples';
import { e80 } from './early-late-fractions';
import { calculateIacc } from './iacc';
import {
  MonauralResults,
  IntermediateResults,
  processChannel,
} from './monaural-processing';
import { octfiltBinaural } from '../octave-band-filtering/octave-band-filtering';
import { correctStarttimeBinaural } from './starttime';

export type BinauralResults = MonauralResults & {
  iacc: number;
  eiacc: number;
  iaccBands: number[];
  eiaccBands: number[];
};

export async function processBinauralAudio(
  samples: BinauralSamples,
  sampleRate: number
): Promise<[BinauralResults, IntermediateResults, Float32Array]> {
  const starttimeCorrected = correctStarttimeBinaural(samples);
  const bands = await octfiltBinaural(starttimeCorrected, sampleRate);

  const iaccBands = [];
  const eiaccBands = [];
  for (const band of bands) {
    const earlyBand = new BinauralSamples(
      e80(band.leftChannel, sampleRate),
      e80(band.rightChannel, sampleRate)
    );

    iaccBands.push(calculateIacc(band));
    eiaccBands.push(calculateIacc(earlyBand));
  }

  const iacc =
    (iaccBands[1] +
      iaccBands[2] +
      iaccBands[3] +
      iaccBands[4] +
      iaccBands[5] +
      iaccBands[6]) /
    6;

  const eiacc =
    (eiaccBands[1] +
      eiaccBands[2] +
      eiaccBands[3] +
      eiaccBands[4] +
      eiaccBands[5] +
      eiaccBands[6]) /
    6;

  // calculate squared impulse response of binaural audio by taking
  // the arithmetic mean of the squared IR of each channel
  const meanSquaredBands = bands.map(band => {
    const meanBand = new Float32Array(band.length);
    for (let i = 0; i < band.length; i += 1) {
      meanBand[i] = (band.leftChannel[i] ** 2 + band.rightChannel[i] ** 2) / 2;
    }
    return meanBand;
  });

  const meanSquaredIR = new Float32Array(starttimeCorrected.length);
  for (let i = 0; i < starttimeCorrected.length; i += 1) {
    meanSquaredIR[i] =
      (starttimeCorrected.leftChannel[i] ** 2 +
        starttimeCorrected.rightChannel[i] ** 2) /
      2;
  }

  const [monauralResults, monauralIntermediateResults] = await processChannel(
    meanSquaredBands,
    sampleRate
  );

  return [
    {
      ...monauralResults,
      iacc,
      eiacc,
      iaccBands,
      eiaccBands,
    },
    monauralIntermediateResults,
    meanSquaredIR,
  ];
}
