const SECONDS_TO_MILLIS = 1000;

/**
 * Calculates the centre time as defined in ISO 3382-1.
 *
 * @param squaredIR Squared impulse response of the audio signal.
 * @param sampleRate Sample rate of the audio signal in Hz.
 * @returns Centre time in milliseconds.
 */
export function calculateCentreTime(
  squaredIR: Float32Array,
  sampleRate: number
): number {
  let numerator = 0;
  let denominator = 0;
  for (let i = 0; i < squaredIR.length; i += 1) {
    const t = i / sampleRate;
    numerator += t * squaredIR[i];
    denominator += squaredIR[i];
  }

  return (numerator / denominator) * SECONDS_TO_MILLIS;
}
