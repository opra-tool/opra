/**
 * Squares each sample.
 */
export function calculateSquaredIR(samples: Float32Array): Float32Array {
  const newSamples = new Float32Array(samples.length);

  for (let i = 0; i < samples.length; i++) {
    newSamples[i] = samples[i] ** 2;
  }

  return newSamples;
}
