const SECONDS_TO_MILLIS = 1000;

/**
 * Calculates Schwerpunktzeit in milliseconds as defined in ISO 3382-1.
 *
 * @param samples Starttime corrected samples of the audio signal.
 * @param sampleRate Sample rate of the audio signal in Hz.
 * @returns Schwerpunktzeit in milliseconds.
 */
export function calculateSchwerpunktzeit(
  samples: Float32Array,
  sampleRate: number
): number {
  let sum1 = 0;
  let sum2 = 0;
  for (let i = 0; i < samples.length; i += 1) {
    sum1 += (i / sampleRate) * samples[i] ** 2;
    sum2 += samples[i] ** 2;
  }

  return (sum1 / sum2) * SECONDS_TO_MILLIS;
}
