/* eslint-disable import/extensions */
import { arraySumSquared } from './math/arraySumSquared';
import { safeLog10 } from './math/safeLog10';

// taken from matlab raqi toolbox FILTCHECK()
const LPE10 = [72.9, 75.9, 78.9, 81.8, 84.8, 87.8, 90.6, 92.8];

export function calculateStrength(
  octaveBands: Float64Array[],
  p0: number
): Float64Array {
  return new Float64Array(
    octaveBands.map((band, i) => {
      const sumSquared = arraySumSquared(band);

      const lpe = 10 * safeLog10(sumSquared / p0 ** 2);

      return lpe - LPE10[i];
    })
  );
}
