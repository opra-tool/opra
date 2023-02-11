import { BinauralSamples } from './binaural-samples';

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

/**
 * Calculate the squared impulse response of binaural audio by taking
 * the arithmetic mean of the squared impulse responses of both channels.
 *
 * @param samples Samples of a binaural impulse response.
 * @returns The mean squared impulse response.
 */
export function calculateMeanSquaredIR(samples: BinauralSamples): Float32Array {
  const meanSquaredIR = new Float32Array(samples.length);
  for (let i = 0; i < samples.length; i += 1) {
    meanSquaredIR[i] =
      (samples.leftChannel[i] ** 2 + samples.rightChannel[i] ** 2) / 2;
  }

  return meanSquaredIR;
}
