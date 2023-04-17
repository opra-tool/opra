import { BinauralSamples } from './binaural-samples';
import { arrayMaxAbs } from '../math/arrays';

/**
 * Corrects the starttime of an audio signal according to ISO 3382-1.
 * Returns the samples after the signal intensity first rises above
 * a value of 20dB below the maximum intensity.
 *
 *
 * @param samples Samples of an audio signal
 * @returns Trimmed samples
 */
export function correctStarttimeMonaural(samples: Float32Array): Float32Array {
  const index = findIndexOfFirstSample20dBBelowMax(samples);

  return trimSamples(samples, index);
}

/**
 * Corrects the starttime of a binaural audio signal according to ISO 3382-1.
 * In case the channels have different starttimes, the earlier one is used for both channels.
 *
 * @see correctStarttimeMonaural
 *
 * @param audio Binaural audio
 * @returns Trimmed binaural audio
 */
export function correctStarttimeBinaural({
  leftChannel: leftSamples,
  rightChannel: rightSamples,
}: BinauralSamples): BinauralSamples {
  const leftIndex = findIndexOfFirstSample20dBBelowMax(leftSamples);
  const rightIndex = findIndexOfFirstSample20dBBelowMax(rightSamples);

  const index = Math.min(leftIndex, rightIndex);

  return new BinauralSamples(
    trimSamples(leftSamples, index),
    trimSamples(rightSamples, index)
  );
}

function findIndexOfFirstSample20dBBelowMax(samples: Float32Array): number {
  const max = arrayMaxAbs(samples);

  return samples.findIndex(el => Math.abs(el) > 0.01 * max);
}

function trimSamples(samples: Float32Array, index: number): Float32Array {
  return samples.subarray(index);
}
