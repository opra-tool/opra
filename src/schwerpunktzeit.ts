import { arraySum } from './math/arraySum';
import { correctStarttimeMonaural } from './starttime';

const SECONDS_TO_MILLIS = 1000;

/**
 * Calculates Schwerpunktzeit in milliseconds as defined in ISO 3382-1.
 *
 * @param samples Samples of the audio signal.
 * @param sampleRate Sample rate of the audio signal in Hz.
 * @returns Schwerpunktzeit in milliseconds.
 */
export function calculateSchwerpunktzeit(
  samples: Float32Array,
  sampleRate: number
): number {
  // TODO: is this already done outside of function?
  const trimmedSamples = correctStarttimeMonaural(samples);

  let sum = 0;
  for (let i = 0; i < trimmedSamples.length; i += 1) {
    sum += (i / sampleRate) * trimmedSamples[i];
  }

  return (sum / arraySum(trimmedSamples)) * SECONDS_TO_MILLIS;
}
