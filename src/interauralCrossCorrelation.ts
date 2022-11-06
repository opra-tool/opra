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
    const leftChannel = octaves[i].getLeftChannel();
    const rightChannel = octaves[i].getRightChannel();

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
    const octave = octaves[i];

    const { e80: e80Left } = earlyLateFractions(
      octave.getLeftChannel(),
      octave.getSampleRate()
    );
    const { e80: e80Right } = earlyLateFractions(
      octave.getRightChannel(),
      octave.getSampleRate()
    );

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
