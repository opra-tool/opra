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

export type MonauralAnalyzeResults = {
  bandsSquaredSum: Float64Array;
  e80BandsSquaredSum: Float64Array;
  l80BandsSquaredSum: Float64Array;
  aWeightedSquaredSum: number;
  edtValues: Float64Array;
  reverbTime: Float64Array;
  c50Values: Float64Array;
  c80Values: Float64Array;
  centerTime: number;
  bassRatio: number;
  squaredImpulseResponse: Point[];
};

export async function processMonauralAudio(
  samples: Float64Array,
  sampleRate: number
): Promise<MonauralAnalyzeResults> {
  const endZeroPaddedAudio = new Float64Array([
    ...samples,
    ...arrayFilledWithZeros(10000),
  ]);

  const octaveBands = await getStarttimeTrimmedAndPaddedOctaveBands(
    endZeroPaddedAudio,
    sampleRate
  );

  const fractions = octaveBands.map(band =>
    earlyLateFractions(band, sampleRate)
  );

  const c50Values = new Float64Array(octaveBands.length);
  const c80Values = new Float64Array(octaveBands.length);
  for (let i = 0; i < octaveBands.length; i += 1) {
    const { c50, c80 } = c50c80(fractions[i]);
    c50Values[i] = c50;
    c80Values[i] = c80;
  }

  const mira = correctStarttimeMonaural(
    aWeightAudioSignal(endZeroPaddedAudio, sampleRate)
  );

  const edtValues = edt(octaveBands, sampleRate);
  const reverbTime = rev(octaveBands, 30, sampleRate);

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

  const bandsSquaredSum = new Float64Array(octaveBands.map(arraySumSquared));

  const e80Bands = fractions.map(val => val.e80);
  const l80Bands = fractions.map(val => val.l80);

  const e80BandsSquaredSum = new Float64Array(e80Bands.map(arraySumSquared));

  const l80BandsSquaredSum = new Float64Array(l80Bands.map(arraySumSquared));

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
  audio: Float64Array,
  sampleRate: number
): Promise<Float64Array[]> {
  const rawBands = await octfilt(audio, sampleRate);

  return rawBands.map(band => {
    const trimmedBand = correctStarttimeMonaural(band);
    return new Float64Array([
      ...trimmedBand,
      ...arrayFilledWithZeros(band.length - trimmedBand.length),
    ]);
  });
}
