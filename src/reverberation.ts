import { arrayCumulativeSum } from './math/arrayCumulativeSum';
import { arrayMax } from './math/arrayMax';
import { arraySum } from './math/arraySum';
import { fitCurve } from './math/fitCurve';
import { safeLog10 } from './math/safeLog10';

/**
 * Returns a portion of the array where min < N < max
 *
 * @param array
 * @param min Minimum value (excluded)
 * @param max Maximum value (excluded)
 */
function trimBetween(
  array: Float64Array,
  min: number,
  max: number
): Float64Array {
  return array.filter(val => val > min && val < max);
}

function calculateMinMax(
  EC: Float64Array,
  min: number,
  max: number,
  fs: number
) {
  const trimmed = trimBetween(EC, min, max);

  const tseg = new Float64Array(trimmed.length);
  for (let ii = 0; ii < trimmed.length; ii += 1) {
    tseg[ii] = (1 / fs) * (ii + 1);
  }

  const { b } = fitCurve(tseg, trimmed);

  return 60 / Math.abs(b);
}

export function calculateReverberation(
  octaveBands: Float32Array[],
  tc: number,
  fs: number
): { edt: number[]; reverbTime: number[] } {
  const edt = [];
  const reverbTime = [];

  for (const band of octaveBands) {
    const squared = band.map(v => v ** 2);
    const a1 = arraySum(squared);
    const b1 = arrayCumulativeSum(squared);

    const SI1 = new Float64Array(b1.map(v => a1 - v));

    const maxSI1 = arrayMax(SI1);
    const EC = new Float64Array(SI1.map(v => 10 * safeLog10(v / maxSI1)));

    edt.push(calculateMinMax(EC, -10, 0, fs));
    reverbTime.push(calculateMinMax(EC, -(5 + tc), -5, fs));
  }

  return { edt, reverbTime };
}
