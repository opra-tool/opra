import { getFrequencyValues } from './components/graphs/common';
import { calculateSoundDampingInAir } from './dampening';
import { calculateLpe10 } from './lpe10';
import { safeLog10 } from './math/safeLog10';

export type Strengths = {
  strength: number[];
  earlyStrength: number[];
  lateStrength: number[];
  averageStrength: number;
  trebleRatio: number;
  earlyBassStrength: number;
  aWeighted: number;
  aWeightedC80: number;
};

type Input = {
  bandsSquaredSum: number[];
  e80BandsSquaredSum: number[];
  l80BandsSquaredSum: number[];
  c80Bands: number[];
  aWeightedSquaredSum: number;
};

type Options = {
  p0: number;
  temperature: number;
  relativeHumidity: number;
};

export async function calculateStrengths(
  {
    bandsSquaredSum,
    e80BandsSquaredSum,
    l80BandsSquaredSum,
    aWeightedSquaredSum,
    c80Bands,
  }: Input,
  { p0, temperature, relativeHumidity }: Options
): Promise<Strengths> {
  const airCoeffs = getFrequencyValues().map(frequency =>
    calculateSoundDampingInAir(temperature, relativeHumidity, frequency)
  );
  const lpe10 = await calculateLpe10(airCoeffs);

  const strength = calculateStrength(bandsSquaredSum, p0, lpe10);
  const earlyStrength = calculateStrength(e80BandsSquaredSum, p0, lpe10);
  const lateStrength = calculateStrength(l80BandsSquaredSum, p0, lpe10);
  const averageStrength = calculateAveragedFrequencyStrength(strength);
  const trebleRatio = calculateTrebleRatio(lateStrength);
  const earlyBassStrength = calculateEarlyBassStrength(earlyStrength);
  const aWeighted = calculateStrengthOfAWeighted(aWeightedSquaredSum, p0);
  const aWeightedC80 = calculateAWeightedC80(c80Bands, aWeighted);

  return {
    strength,
    earlyStrength,
    lateStrength,
    averageStrength,
    trebleRatio,
    earlyBassStrength,
    aWeighted,
    aWeightedC80,
  };
}

function calculateStrength(
  bandsSquaredSum: number[],
  p0: number,
  lpe10: number[]
): number[] {
  const strength = [];

  for (let i = 0; i < bandsSquaredSum.length; i += 1) {
    const lpe = 10 * safeLog10(bandsSquaredSum[i] / p0 ** 2);

    strength.push(lpe - lpe10[i]);
  }

  return strength;
}

function calculateStrengthOfAWeighted(
  aWeightedSquaredSum: number,
  p0: number
): number {
  const lf = 100;
  const l = 10 * safeLog10(aWeightedSquaredSum / p0 ** 2);

  return l - lf;
}

function calculateAveragedFrequencyStrength(strength: number[]): number {
  return (strength[3] + strength[4]) / 2;
}

function calculateTrebleRatio(lateStrength: number[]): number {
  return lateStrength[6] - (lateStrength[4] + lateStrength[5]) / 2;
}

function calculateEarlyBassStrength(earlyStrength: number[]): number {
  return (earlyStrength[1] + earlyStrength[2] + earlyStrength[3]) / 3;
}

function calculateAWeightedC80(c80Bands: number[], aWeighted: number): number {
  return (c80Bands[3] + c80Bands[4]) / 2 - 0.62 * aWeighted;
}
