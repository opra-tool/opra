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
};

type Options = {
  p0: number;
  temperature: number;
  relativeHumidity: number;
};

/**
 * Calculated as defined in IEC 61672-1:2013.
 *
 * Note: The value for 1kHz has been rounded to 0
 */
const A_WEIGHTING_CORRECTIONS = [
  -26.3567, // 62.5 Hz
  -16.1897, // 125 Hz
  -8.67483, // 250 Hz
  -3.24781, // 500 Hz
  0, // 1000 Hz
  1.20167, // 2000 Hz
  0.963598, // 4000 Hz
  -1.14688, // 8000 Hz
];

export async function calculateStrengths(
  { bandsSquaredSum, e80BandsSquaredSum, l80BandsSquaredSum, c80Bands }: Input,
  { p0, temperature, relativeHumidity }: Options
): Promise<Strengths> {
  const airCoeffs = getFrequencyValues().map(frequency =>
    calculateSoundDampingInAir(temperature, relativeHumidity, frequency)
  );
  const lpe10 = await calculateLpe10(airCoeffs);

  const strength = calculateStaerkemass(bandsSquaredSum, p0, lpe10);
  const earlyStrength = calculateStaerkemass(e80BandsSquaredSum, p0, lpe10);
  const lateStrength = calculateStaerkemass(l80BandsSquaredSum, p0, lpe10);
  const averageStrength = calculateMeanStaerkemass(strength);
  const trebleRatio = calculateTrebleRatio(lateStrength);
  const earlyBassStrength = calculateEarlyBassStaerkemass(earlyStrength);
  const aWeighted = calculateAWeightedStaerkemeass(strength);
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

function calculateStaerkemass(
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

function calculateAWeightedStaerkemeass(strength: number[]): number {
  return calculateMeanStaerkemass(
    strength.map((val, i) => val + A_WEIGHTING_CORRECTIONS[i])
  );
}

function calculateMeanStaerkemass(strength: number[]): number {
  return (strength[3] + strength[4]) / 2;
}

function calculateTrebleRatio(lateStrength: number[]): number {
  return lateStrength[6] - (lateStrength[4] + lateStrength[5]) / 2;
}

function calculateEarlyBassStaerkemass(earlyStrength: number[]): number {
  return (earlyStrength[1] + earlyStrength[2] + earlyStrength[3]) / 3;
}

function calculateAWeightedC80(c80Bands: number[], aWeighted: number): number {
  return (c80Bands[3] + c80Bands[4]) / 2 - 0.62 * aWeighted;
}
