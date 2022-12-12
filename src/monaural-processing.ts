import { c50c80 } from './c50c80';
import { calculateCentreTime } from './centre-time';
import { earlyLateFractions } from './early-late-fractions';
import { arraySumSquared } from './math/arraySumSquared';
import { octfilt } from './octfilt';
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
  squaredImpulseResponse: Point[];
  centreTime: number;
  bassRatio: number;
};

export async function processMonauralAudio(
  samples: Float32Array,
  sampleRate: number
): Promise<MonauralResults> {
  const starttimeCorrected = correctStarttimeMonaural(samples);
  const bands = await octfilt(starttimeCorrected, sampleRate);

  const squaredIR = new Float32Array(starttimeCorrected.length);
  for (let i = 0; i < starttimeCorrected.length; i += 1) {
    squaredIR[i] = starttimeCorrected[i] ** 2;
  }

  return processChannel(squaredIR, bands, sampleRate);
}

export async function processChannel(
  squaredIR: Float32Array,
  bands: Float32Array[],
  sampleRate: number
): Promise<MonauralResults> {
  const fractions = bands.map(band => earlyLateFractions(band, sampleRate));

  const c50Values = [];
  const c80Values = [];
  for (let i = 0; i < bands.length; i += 1) {
    const { c50, c80 } = c50c80(fractions[i]);
    c50Values.push(c50);
    c80Values.push(c80);
  }

  const { edt, reverbTime } = calculateReverberation(bands, 20, sampleRate);

  const bassRatio =
    (reverbTime[1] + reverbTime[2]) / (reverbTime[3] + reverbTime[4]);

  const centreTime = calculateCentreTime(squaredIR, sampleRate);

  // TODO: move into graph
  const squaredImpulseResponse = [];
  for (let i = 0; i < squaredIR.length; i += 1) {
    squaredImpulseResponse.push({
      x: (i + 1) / sampleRate,
      y: squaredIR[i],
    });
  }

  const bandsSquaredSum = bands.map(arraySumSquared);

  const e80Bands = fractions.map(val => val.e80);
  const l80Bands = fractions.map(val => val.l80);

  const e80BandsSquaredSum = e80Bands.map(arraySumSquared);

  const l80BandsSquaredSum = l80Bands.map(arraySumSquared);

  return {
    bandsSquaredSum,
    e80BandsSquaredSum,
    l80BandsSquaredSum,
    edtBands: edt,
    reverbTimeBands: reverbTime,
    c50Bands: c50Values,
    c80Bands: c80Values,
    bassRatio,
    centreTime,
    squaredImpulseResponse,
  };
}
