import { arraySum } from '../../math/arrays';
import { e80Calc } from '../early-late-fractions';
import { createOctaveBandParameterImplementation } from '../param-implementation';

export const EARLY_LATERAL_ENERGY_FRACTION =
  createOctaveBandParameterImplementation(
    'earlyLateralEnergyFraction',
    'mid-side',
    bands =>
      bands.collect(band => {
        const startTime = Math.round(0.005 * band.sampleRate);

        const e80 = e80Calc(band);

        const numerator = arraySum(e80.getChannel(1).subarray(startTime));
        const denominator = arraySum(e80.getChannel(0));

        return numerator / denominator;
      }),
    octaveBandValues =>
      (octaveBandValues.band(125) +
        octaveBandValues.band(250) +
        octaveBandValues.band(500) +
        octaveBandValues.band(1000)) /
      4
  );
