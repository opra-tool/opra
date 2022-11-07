import { arraySumSquared } from './math/arraySumSquared';
import { safeLog10 } from './math/safeLog10';

// taken from matlab raqi toolbox FILTCHECK()
const LPE10 = [72.9, 75.9, 78.9, 81.8, 84.8, 87.8, 90.6, 92.8];

export function calculateStrength(
  bandsSquaredSum: Float64Array,
  p0: number
): Float64Array {
  return bandsSquaredSum.map((band, i) => {
    const lpe = 10 * safeLog10(band / p0 ** 2);

    return lpe - LPE10[i];
  });
}

export function calculateStrengthOfAWeighted(
  aWeighted: Float64Array,
  p0: number
): number {
  const sumSquared = arraySumSquared(aWeighted);
  const lf = 100;
  const l = 10 * safeLog10(sumSquared / p0 ** 2);

  return l - lf;
}

export function calculateAveragedFrequencyStrength(
  strength: Float64Array
): number {
  return (strength[3] + strength[4]) / 2;
}

export function calculateTrebleRatio(lateStrength: Float64Array): number {
  return lateStrength[6] - (lateStrength[4] + lateStrength[5]) / 2;
}

export function calculateEarlyBassStrength(
  earlyStrength: Float64Array
): number {
  return (earlyStrength[1] + earlyStrength[2] + earlyStrength[3]) / 3;
}
