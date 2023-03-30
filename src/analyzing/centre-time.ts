/**
 * Calculates the centre time as defined in ISO 3382-1.
 *
 * @param squaredBands Squared octave bands of the audio signal.
 * @param sampleRate Sample rate of the audio signal in Hz.
 * @returns Centre time in seconds.
 */
export function calculateCentreTime(
  squaredBands: Float32Array[],
  sampleRate: number
): number {
  const bands500Hz1000Hz = squaredBands.slice(3, 5);

  const centreTimes = bands500Hz1000Hz.map(b => {
    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < b.length; i += 1) {
      const t = i / sampleRate;
      numerator += t * b[i];
      denominator += b[i];
    }

    return numerator / denominator;
  });

  return (centreTimes[0] + centreTimes[1]) / 2;
}
