import { e80 } from './early-late-fractions';
import { arraySum } from '../math/arrays';

/**
 * Calculates early lateral energy fraction as defined in ISO 3382-1.
 *
 * @param midBandsSquared Squared octave bands of a signal measured with an omnidirectional microphone.
 * @param sideBandsSquared Squared octave bands of a signal measured with a figure-of-eight pattern microphone.
 */
export function calculateEarlyLateralEnergyFraction(
  midBandsSquared: Float32Array[],
  sideBandsSquared: Float32Array[],
  sampleRate: number
): number[] {
  if (midBandsSquared.length !== sideBandsSquared.length) {
    throw new Error(
      'expected mid and side signals to have the same number of octave bands'
    );
  }

  const startTime = Math.round(0.005 * sampleRate);

  const res = [];
  for (let i = 0; i < midBandsSquared.length; i += 1) {
    const numerator = arraySum(
      e80(sideBandsSquared[i], sampleRate).subarray(startTime)
    );
    const denominator = arraySum(e80(midBandsSquared[i], sampleRate));

    res.push(numerator / denominator);
  }

  return res;
}
