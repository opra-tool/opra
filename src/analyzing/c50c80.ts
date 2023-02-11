import { arraySum } from '../math/arraySum';
import { safeLog10 } from '../math/safeLog10';

type EarlyLateFractions = {
  e50: Float32Array;
  l50: Float32Array;
  e80: Float32Array;
  l80: Float32Array;
};

type C50C80 = {
  c50: number;
  c80: number;
};

/**
 * Calculate C50 and C80 according to ISO 3382-1.
 *
 * @param earlyLateFractions An object containing E50, L50, E80 and L80
 * @returns An object containing c50 and c80
 */
export function c50c80({ e50, l50, e80, l80 }: EarlyLateFractions): C50C80 {
  const e50Sum = arraySum(e50);
  const l50Sum = arraySum(l50);
  const e80Sum = arraySum(e80);
  const l80Sum = arraySum(l80);

  const c50 = 10 * safeLog10(e50Sum / l50Sum);
  const c80 = 10 * safeLog10(e80Sum / l80Sum);

  return {
    c50,
    c80,
  };
}
