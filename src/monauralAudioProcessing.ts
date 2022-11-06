import { c50c80Calculation } from './c50c80Calculation';
import { earlyLateFractions } from './earlyLateFractions';
import { aWeightAudioSignal } from './filtering/aWeighting';
import { arrayFilledWithZeros } from './math/arrayFilledWithZeros';
import { octfilt } from './octfilt';
import { edt, rev } from './reverberation';
import { trimStarttimeMonaural } from './starttimeDetection';
import { calculateStrengthOfAWeighted } from './strength';
import { ts } from './ts';

type Point = {
  x: number;
  y: number;
};

export type MonauralAnalyzeResults = {
  bands: Float64Array[];
  e80Bands: Float64Array[];
  l80Bands: Float64Array[];
  edtValues: Float64Array;
  reverbTime: Float64Array;
  c50Values: Float64Array;
  c80Values: Float64Array;
  centerTime: number;
  bassRatio: number;
  aWeightedStrength: number;
  aWeightedC80: number;
  squaredImpulseResponse: Point[];
};

// currently only applicable to RAVEN generated
// room impulse responses
const RAVEN_PRESSURE_FITTING = 0.000001;

export async function processMonauralAudio(
  audio: Float64Array,
  sampleRate: number
): Promise<MonauralAnalyzeResults> {
  // TODO: rename: starttime trimmed raw audio
  const mir = trimStarttimeMonaural(audio);
  const endZeroPaddedAudio = new Float64Array([
    ...audio,
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
    const { c50, c80 } = c50c80Calculation(fractions[i]);
    c50Values[i] = c50;
    c80Values[i] = c80;
  }

  const e80Bands = fractions.map(val => val.e80);
  const l80Bands = fractions.map(val => val.l80);

  const mira = trimStarttimeMonaural(
    aWeightAudioSignal(endZeroPaddedAudio, sampleRate)
  );
  const aWeightedStrength = calculateStrengthOfAWeighted(
    mira,
    RAVEN_PRESSURE_FITTING
  );
  const aWeightedC80 =
    (c80Values[3] + c80Values[4]) / 2 - 0.62 * aWeightedStrength;

  const edtValues = edt(octaveBands, sampleRate);
  const reverbTime = rev(octaveBands, 30, sampleRate);

  const bassRatio =
    (reverbTime[1] + reverbTime[2]) / (reverbTime[3] + reverbTime[4]);
  const centerTime = ts(mir, sampleRate);

  // TODO: extract into method
  const squaredImpulseResponse = [];
  for (let i = 0; i < audio.length; i += 1) {
    squaredImpulseResponse.push({
      x: (i + 1) / sampleRate,
      y: Math.abs(audio[i]),
    });
  }

  return {
    bands: octaveBands,
    e80Bands,
    l80Bands,
    edtValues,
    reverbTime,
    c50Values,
    c80Values,
    bassRatio,
    centerTime,
    aWeightedStrength,
    aWeightedC80,
    squaredImpulseResponse,
  };
}

async function getStarttimeTrimmedAndPaddedOctaveBands(
  audio: Float64Array,
  sampleRate: number
): Promise<Float64Array[]> {
  const rawBands = await octfilt(audio, sampleRate);

  return rawBands.map(band => {
    const trimmedBand = trimStarttimeMonaural(band);
    return new Float64Array([
      ...trimmedBand,
      ...arrayFilledWithZeros(band.length - trimmedBand.length),
    ]);
  });
}
