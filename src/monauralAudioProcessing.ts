import { c50c80 } from './c50c80';
import { calculateCenterTime } from './centerTime';
import { earlyLateFractions } from './earlyLateFractions';
import { aWeightAudioSignal } from './filtering/aWeighting';
import { arrayFilledWithZeros } from './math/arrayFilledWithZeros';
import { arraySumSquared } from './math/arraySumSquared';
import { octfilt } from './octfilt';
import { edt, rev } from './reverberation';
import { correctStarttimeMonaural } from './starttime';

type Point = {
  x: number;
  y: number;
};

export type MonauralResults = {
  bandsSquaredSum: number[];
  e80BandsSquaredSum: number[];
  l80BandsSquaredSum: number[];
  aWeightedSquaredSum: number;
  edtValues: number[];
  reverbTime: number[];
  c50Values: number[];
  c80Values: number[];
  centerTime: number;
  bassRatio: number;
  squaredImpulseResponse: Point[];
};

export async function processMonauralAudio(
  samples: Float32Array,
  sampleRate: number
): Promise<MonauralResults> {
  const zeroPadded = new Float32Array([
    ...samples,
    ...arrayFilledWithZeros(10000),
  ]);

  const bands = await getStarttimeTrimmedAndPaddedOctaveBands(
    zeroPadded,
    sampleRate
  );

  const fractions = bands.map(band => earlyLateFractions(band, sampleRate));

  const c50Values = [];
  const c80Values = [];
  for (let i = 0; i < bands.length; i += 1) {
    const { c50, c80 } = c50c80(fractions[i]);
    c50Values.push(c50);
    c80Values.push(c80);
  }

  const mira = correctStarttimeMonaural(
    // TODO: make prettier
    new Float32Array(aWeightAudioSignal(zeroPadded, sampleRate))
  );

  const edtValues = edt(bands, sampleRate);
  const reverbTime = rev(bands, 30, sampleRate);

  const bassRatio =
    (reverbTime[1] + reverbTime[2]) / (reverbTime[3] + reverbTime[4]);
  const centerTime = calculateCenterTime(samples, sampleRate);

  // TODO: extract into method
  const squaredImpulseResponse = [];
  for (let i = 0; i < samples.length; i += 1) {
    squaredImpulseResponse.push({
      x: (i + 1) / sampleRate,
      y: Math.abs(samples[i]),
    });
  }

  const bandsSquaredSum = bands.map(arraySumSquared);

  const e80Bands = fractions.map(val => val.e80);
  const l80Bands = fractions.map(val => val.l80);

  const e80BandsSquaredSum = e80Bands.map(arraySumSquared);

  const l80BandsSquaredSum = l80Bands.map(arraySumSquared);

  const aWeightedSquaredSum = arraySumSquared(mira);

  return {
    bandsSquaredSum,
    e80BandsSquaredSum,
    l80BandsSquaredSum,
    aWeightedSquaredSum,
    edtValues,
    reverbTime,
    c50Values,
    c80Values,
    bassRatio,
    centerTime,
    squaredImpulseResponse,
  };
}

async function getStarttimeTrimmedAndPaddedOctaveBands(
  samples: Float32Array,
  sampleRate: number
): Promise<Float32Array[]> {
  const rawBands = await octfilt(samples, sampleRate);

  return rawBands.map(band => {
    const trimmedBand = correctStarttimeMonaural(band);
    return new Float32Array([
      ...trimmedBand,
      ...arrayFilledWithZeros(band.length - trimmedBand.length),
    ]);
  });
}
