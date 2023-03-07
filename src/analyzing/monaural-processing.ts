import { c50c80 } from './c50c80';
import { calculateCentreTime } from './centre-time';
import { earlyLateFractions } from './early-late-fractions';
import { calculateSquaredIR } from './squared-impulse-response';
import { arraySum } from '../math/arraySum';
import { octfilt } from '../filtering/octfilt';
import { calculateReverberation } from './reverberation';
import { correctStarttimeMonaural } from './starttime';

type Point = {
  x: number;
  y: number;
};

export type MonauralResults = {
  bandsSquaredSum: number[];
  e80BandsSquaredSum: number[];
  l80BandsSquaredSum: number[];
  edtBands: number[];
  reverbTimeBands: number[];
  c50Bands: number[];
  c80Bands: number[];
  squaredIRPoints: Point[];
  centreTime: number;
  bassRatio: number;
};

export async function processMonauralAudio(
  samples: Float32Array,
  sampleRate: number
): Promise<MonauralResults> {
  const starttimeCorrected = correctStarttimeMonaural(samples);
  const squaredIR = calculateSquaredIR(starttimeCorrected);

  const bands = await octfilt(starttimeCorrected, sampleRate);
  const bandsSquared = bands.map(calculateSquaredIR);

  return processChannel(squaredIR, bandsSquared, sampleRate);
}

export async function processChannel(
  squaredIR: Float32Array,
  bandsSquared: Float32Array[],
  sampleRate: number
): Promise<MonauralResults> {
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

  const { edtBands, reverbTimeBands } = calculateReverberation(
    bandsSquared,
    sampleRate
  );

  const bassRatio =
    (reverbTimeBands[1] + reverbTimeBands[2]) /
    (reverbTimeBands[3] + reverbTimeBands[4]);

  const centreTime = calculateCentreTime(squaredIR, sampleRate);

  const squaredIRPoints = [];
  for (let i = 0; i < squaredIR.length; i += 1) {
    squaredIRPoints.push({
      x: (i + 1) / sampleRate,
      y: squaredIR[i],
    });
  }

  const bandsSquaredSum = bandsSquared.map(arraySum);
  const e80BandsSquaredSum = fractions.map(val => val.e80).map(arraySum);
  const l80BandsSquaredSum = fractions.map(val => val.l80).map(arraySum);

  return {
    bandsSquaredSum,
    e80BandsSquaredSum,
    l80BandsSquaredSum,
    edtBands,
    reverbTimeBands,
    c50Bands,
    c80Bands,
    bassRatio,
    centreTime,
    squaredIRPoints,
  };
}
