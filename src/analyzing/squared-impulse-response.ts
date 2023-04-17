/**
 * Given an impulse response, calculates the squared impulse response.
 *
 * @param samples Samples of a monaural impulse response.
 * @returns The squared impulse response.
 */
export function calculateSquaredIR(samples: Float32Array): Float32Array {
  const squaredIR = new Float32Array(samples.length);

  for (let i = 0; i < samples.length; i += 1) {
    squaredIR[i] = samples[i] ** 2;
  }

  return squaredIR;
}
