import { c50c80 } from './c50c80';
import { calculateCentreTime } from './centre-time';
import { earlyLateFractions } from './early-late-fractions';
import { calculateSquaredIR } from './squared-impulse-response';
import { arraySum } from '../math/arrays';
import { octfilt } from '../octave-band-filtering/octave-band-filtering';
import { calculateReverberation } from './reverberation';
import { correctStarttimeMonaural } from './starttime';
import { meanDecibel } from '../math/decibels';

export type IntermediateResults = {
  bandsSquaredSum: number[];
  e50BandsSquaredSum: number[];
  e80BandsSquaredSum: number[];
  l80BandsSquaredSum: number[];
};

export type MonauralResults = {
  edtBands: number[];
  reverbTimeBands: number[];
  reverbTime: number;
  c50Bands: number[];
  c80Bands: number[];
  c80: number;
  centreTime: number;
  bassRatio: number;
};

export async function processMonauralAudio(
  samples: Float32Array,
  sampleRate: number
): Promise<[MonauralResults, IntermediateResults, Float32Array]> {
  const starttimeCorrected = correctStarttimeMonaural(samples);

  const bands = await octfilt(starttimeCorrected, sampleRate);
  const bandsSquared = bands.map(calculateSquaredIR);

  return [
    ...(await processChannel(bandsSquared, sampleRate)),
    calculateSquaredIR(starttimeCorrected),
  ];
}

export async function processChannel(
  bandsSquared: Float32Array[],
  sampleRate: number
): Promise<[MonauralResults, IntermediateResults]> {
  const fractions = bandsSquared.map(band =>
    earlyLateFractions(band, sampleRate)
  );

  const c50Bands = [];
  const c80Bands = [];
  for (let i = 0; i < fractions.length; i += 1) {
    const { c50, c80 } = c50c80(fractions[i]);
    c50Bands.push(c50);
    c80Bands.push(c80);
  }

  const c80 = meanDecibel(c80Bands[3], c80Bands[4]);

  const { edtBands, reverbTimeBands } = calculateReverberation(
    bandsSquared,
    sampleRate
  );

  const reverbTime = (reverbTimeBands[3] + reverbTimeBands[4]) / 2;

  const bassRatio =
    (reverbTimeBands[1] + reverbTimeBands[2]) /
    (reverbTimeBands[3] + reverbTimeBands[4]);

  const centreTime = calculateCentreTime(bandsSquared, sampleRate);

  const bandsSquaredSum = bandsSquared.map(arraySum);
  const e50BandsSquaredSum = fractions.map(val => val.e50).map(arraySum);
  const e80BandsSquaredSum = fractions.map(val => val.e80).map(arraySum);
  const l80BandsSquaredSum = fractions.map(val => val.l80).map(arraySum);

  return [
    {
      edtBands,
      reverbTimeBands,
      reverbTime,
      c50Bands,
      c80Bands,
      c80,
      bassRatio,
      centreTime,
    },
    {
      bandsSquaredSum,
      e50BandsSquaredSum,
      e80BandsSquaredSum,
      l80BandsSquaredSum,
    },
  ];
}
