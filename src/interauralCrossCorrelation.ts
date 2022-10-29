import { elf } from './elf';
import { arrayMax } from './math/arrayMax';
import { arraySumSquared } from './math/arraySumSquared';
import { normalizeArray } from './math/normalizeArray';
import { xcorr } from './xcorr';

/**
 * Performs interaural cross correlation on two channels, which previously have been separated into their octave bands.
 *
 * @param leftBands Octave bands of left channel
 * @param rightBands Octave bands of right channel
 * @returns
 */
export async function interauralCrossCorrelation(
  leftBands: Float64Array[],
  rightBands: Float64Array[]
): Promise<Float64Array> {
  if (leftBands.length !== rightBands.length) {
    throw new Error(
      'expected left and right channel to have the same number of octave bands'
    );
  }

  const numOctaveBands = leftBands.length;

  const res = new Float64Array(numOctaveBands);
  for (let i = 0; i < numOctaveBands; i += 1) {
    const leftChannel = leftBands[i];
    const rightChannel = rightBands[i];

    const leftSum = arraySumSquared(leftChannel);
    const rightSum = arraySumSquared(rightChannel);

    const crossCorrelated = xcorr(leftChannel, rightChannel);

    const normalized = normalizeArray(
      crossCorrelated,
      Math.sqrt(leftSum * rightSum)
    );

    res[i] = arrayMax(normalized);
  }

  return res;
}

export async function earlyInterauralCrossCorrelation(
  leftBands: Float64Array[],
  rightBands: Float64Array[],
  fs: number
) {
  if (leftBands.length !== rightBands.length) {
    throw new Error(
      'expected left and right channel to have the same number of octave bands'
    );
  }

  const numOctaveBands = leftBands.length;
  const res = new Float64Array(numOctaveBands);
  for (let i = 0; i < numOctaveBands; i += 1) {
    const leftChannel = leftBands[i];
    const rightChannel = rightBands[i];

    const { e80: e80Left } = elf(leftChannel, fs);
    const { e80: e80Right } = elf(rightChannel, fs);

    const leftSum = arraySumSquared(e80Left);
    const rightSum = arraySumSquared(e80Right);

    const crossCorrelated = xcorr(e80Left, e80Right);

    const normalized = normalizeArray(
      crossCorrelated,
      Math.sqrt(leftSum * rightSum)
    );

    res[i] = arrayMax(normalized);
  }

  return res;
}
