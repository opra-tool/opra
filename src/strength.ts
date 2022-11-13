import { arraySumSquared } from './math/arraySumSquared';
import { safeLog10 } from './math/safeLog10';

// taken from matlab raqi toolbox FILTCHECK()
const LPE10 = [72.9, 75.9, 78.9, 81.8, 84.8, 87.8, 90.6, 92.8];

export function calculateStrength(
  bandsSquaredSum: Float64Array,
  p0: number
): number[] {
  const strength = [];

  for (let i = 0; i < bandsSquaredSum.length; i += 1) {
    const lpe = 10 * safeLog10(bandsSquaredSum[i] / p0 ** 2);

    strength.push(lpe - LPE10[i]);
  }

  return strength;
}

export function calculateStrengthOfAWeighted(
  aWeightedSquaredSum: number,
  p0: number
): number {
  const lf = 100;
  const l = 10 * safeLog10(aWeightedSquaredSum / p0 ** 2);

  return l - lf;
}

export function calculateAveragedFrequencyStrength(strength: number[]): number {
  return (strength[3] + strength[4]) / 2;
}

export function calculateTrebleRatio(lateStrength: number[]): number {
  return lateStrength[6] - (lateStrength[4] + lateStrength[5]) / 2;
}

export function calculateEarlyBassStrength(earlyStrength: number[]): number {
  return (earlyStrength[1] + earlyStrength[2] + earlyStrength[3]) / 3;
}
