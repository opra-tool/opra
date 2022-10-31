import { c50c80Calculation } from './c50c80Calculation';
import { earlyLateFractions } from './earlyLateFractions';
import { aWeightAudioSignal } from './filtering/aWeighting';
import { arrayFilledWithZeros } from './math/arrayFilledWithZeros';
import { octfilt } from './octfilt';
import { edt, rev } from './reverberation';
import { trimStarttimeMonaural } from './starttimeDetection';
import { calculateStrength, calculateStrengthOfAWeighted } from './strength';
import { ts } from './ts';

type Point = {
  x: number;
  y: number;
};

export type MonauralAnalyzeResults = {
  edtValues: Float64Array;
  reverbTime: Float64Array;
  c50Values: Float64Array;
  c80Values: Float64Array;
  strength: Float64Array;
  earlyStrength: Float64Array;
  lateStrength: Float64Array;
  centerTime: number;
  earlyBassStrength: number;
  bassRatio: number;
  trebleRatio: number;
  aWeightedStrength: number;
  aWeightedC80: number;
  squaredImpulseResponse: Point[];
};

// currently only applicable to RAVEN generated
// room impulse responses
const PRESSURE_FITTING = 0.000001;

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

  // octave band filtering
  const octaveBands = await octfilt(endZeroPaddedAudio, sampleRate);
  // TODO: rename: individually startime trimmed and zero-padded octave bands
  const miro = octaveBands.map(band => {
    const trimmedBand = trimStarttimeMonaural(band);
    return new Float64Array([
      ...trimmedBand,
      ...arrayFilledWithZeros(band.length - trimmedBand.length),
    ]);
  });

  const fractions = miro.map(band => earlyLateFractions(band, sampleRate));

  const c50Values = new Float64Array(miro.length);
  const c80Values = new Float64Array(miro.length);
  for (let i = 0; i < miro.length; i += 1) {
    const { c50, c80 } = c50c80Calculation(fractions[i]);
    c50Values[i] = c50;
    c80Values[i] = c80;
  }

  const strength = calculateStrength(miro, PRESSURE_FITTING);
  const earlyStrength = calculateStrength(
    fractions.map(val => val.e80),
    PRESSURE_FITTING
  );
  const lateStrength = calculateStrength(
    fractions.map(val => val.l80),
    PRESSURE_FITTING
  );

  const mira = trimStarttimeMonaural(
    aWeightAudioSignal(endZeroPaddedAudio, sampleRate)
  );
  const aWeightedStrength = calculateStrengthOfAWeighted(
    mira,
    PRESSURE_FITTING
  );
  const aWeightedC80 =
    (c80Values[3] + c80Values[4]) / 2 - 0.62 * aWeightedStrength;

  const edtValues = edt(miro, sampleRate);
  const reverbTime = rev(miro, 30, sampleRate);

  const trebleRatio = lateStrength[6] - (lateStrength[4] + lateStrength[5]) / 2;
  const bassRatio =
    (reverbTime[1] + reverbTime[2]) / (reverbTime[3] + reverbTime[4]);
  const earlyBassStrength =
    (earlyStrength[1] + earlyStrength[2] + earlyStrength[3]) / 3;
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
    edtValues,
    reverbTime,
    c50Values,
    c80Values,
    strength,
    earlyStrength,
    lateStrength,
    centerTime,
    earlyBassStrength,
    bassRatio,
    trebleRatio,
    aWeightedStrength,
    aWeightedC80,
    squaredImpulseResponse,
  };
}
