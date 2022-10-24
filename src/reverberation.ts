/* eslint-disable import/extensions */
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

function performCalculation(
  octaveBands: Float64Array[],
  min: number,
  max: number,
  fs: number
): Float64Array {
  const res = new Float64Array(octaveBands.length);

  for (let i = 0; i < octaveBands.length; i += 1) {
    const squared = octaveBands[i].map(v => v ** 2);
    const a1 = arraySum(squared);
    const b1 = arrayCumulativeSum(squared);

    const SI1 = new Float64Array(b1.map(v => a1 - v));

    const maxSI1 = arrayMax(SI1);
    const EC = new Float64Array(SI1.map(v => 10 * safeLog10(v / maxSI1)));
    const trimmed = trimBetween(EC, min, max);

    const tseg = new Float64Array(trimmed.length);
    for (let ii = 0; ii < trimmed.length; ii += 1) {
      tseg[ii] = (1 / fs) * (ii + 1);
    }

    const { b } = fitCurve(tseg, trimmed);
    res[i] = 60 / Math.abs(b);
  }

  return res;
}

export function edt(octaveBands: Float64Array[], fs: number): Float64Array {
  return performCalculation(octaveBands, -10, 0, fs);
}

export function rev(
  octaveBands: Float64Array[],
  tc: number,
  fs: number
): Float64Array {
  return performCalculation(octaveBands, -(5 + tc), -5, fs);
}
