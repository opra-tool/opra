import { arraySum } from './math/arraySum';
import { correctStarttimeMonaural } from './starttime';

/**
 * TODO:
 * Calculates the center time in milliseconds as defined in ...
 *
 * @param samples The samples of the audio signal.
 * @param sampleRate The sample rate of the audio signal.
 * @returns The center time in milliseconds.
 */
export function calculateCenterTime(
  samples: Float64Array,
  sampleRate: number
): number {
  const trimmedSamples = correctStarttimeMonaural(samples);

  let out = 0;
  for (let i = 0; i < trimmedSamples.length; i += 1) {
    out += (i / sampleRate) * trimmedSamples[i];
  }

  return (out / arraySum(trimmedSamples)) * 1000;
}
