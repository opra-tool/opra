import { BinauralAudio } from './audio/BinauralAudio';
import { earlyLateFractions } from './earlyLateFractions';
import { arrayMax } from './math/arrayMax';
import { arraySumSquared } from './math/arraySumSquared';
import { normalizeArray } from './math/normalizeArray';
import { xcorr } from './xcorr';

/**
 * Performs interaural cross correlation on binaural octave bands.
 *
 * @param octaves Binaural octave bands
 * @returns
 */
export async function interauralCrossCorrelation(
  octaves: BinauralAudio[]
): Promise<Float64Array> {
  const res = new Float64Array(octaves.length);
  for (let i = 0; i < octaves.length; i += 1) {
    const { leftSamples, rightSamples } = octaves[i];

    const leftSum = arraySumSquared(leftSamples);
    const rightSum = arraySumSquared(rightSamples);

    const crossCorrelated = xcorr(leftSamples, rightSamples);

    const normalized = normalizeArray(
      crossCorrelated,
      Math.sqrt(leftSum * rightSum)
    );

    res[i] = arrayMax(normalized);
  }

  return res;
}

/**
 * Performs early interaural cross correlation on binaural octave bands.
 *
 * @param octaves Binaural octave bands
 * @returns
 */
export async function earlyInterauralCrossCorrelation(
  octaves: BinauralAudio[]
): Promise<Float64Array> {
  const res = new Float64Array(octaves.length);
  for (let i = 0; i < octaves.length; i += 1) {
    const { leftSamples, rightSamples, sampleRate } = octaves[i];

    const { e80: e80Left } = earlyLateFractions(leftSamples, sampleRate);
    const { e80: e80Right } = earlyLateFractions(rightSamples, sampleRate);

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
