import { e80Calc } from './early-late-fractions';
import { arraySum } from '../math/arrays';
import { IRBuffer } from './buffer';

/**
 * Calculates early lateral energy fraction as defined in ISO 3382-1.
 */
export function calculateEarlyLateralEnergyFraction(buffer: IRBuffer): number {
  buffer.assertStereo();

  const startTime = Math.round(0.005 * buffer.sampleRate);

  const e80 = e80Calc(buffer);

  const numerator = arraySum(e80.getChannel(1).subarray(startTime));
  const denominator = arraySum(e80.getChannel(0));

  return numerator / denominator;
}
