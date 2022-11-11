import { BinauralAudio } from './audio/BinauralAudio';
import { arrayMax } from './math/arrayMax';
import { arraySumSquared } from './math/arraySumSquared';
import { normalizeArray } from './math/normalizeArray';
import { xcorr } from './xcorr';

/**
 * Calculates the interaural cross correlation on binaural audio as defined in ISO 3382-1.
 *
 * @param audio Binaural audio
 * @returns IACC for the given audio channels
 */
export function interauralCrossCorrelation({
  leftSamples,
  rightSamples,
}: BinauralAudio): number {
  const leftSum = arraySumSquared(leftSamples);
  const rightSum = arraySumSquared(rightSamples);

  const crossCorrelated = xcorr(leftSamples, rightSamples);

  const normalized = normalizeArray(
    crossCorrelated,
    Math.sqrt(leftSum * rightSum)
  );

  return arrayMax(normalized);
}
