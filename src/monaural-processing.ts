import { c50c80 } from './c50c80';
import { calculateCentreTime } from './centre-time';
import { earlyLateFractions } from './early-late-fractions';
import { calculateSquaredIR } from './squared-impulse-response';
import { arraySum } from './math/arraySum';
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

  const c50Values = [];
  const c80Values = [];
  for (let i = 0; i < fractions.length; i += 1) {
    const { c50, c80 } = c50c80(fractions[i]);
    c50Values.push(c50);
    c80Values.push(c80);
  }

  const { edt, reverbTime } = calculateReverberation(
    bandsSquared,
    20,
    sampleRate
  );

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

  const bandsSquaredSum = bandsSquared.map(arraySum);
  const e80BandsSquaredSum = fractions.map(val => val.e80).map(arraySum);
  const l80BandsSquaredSum = fractions.map(val => val.l80).map(arraySum);

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
