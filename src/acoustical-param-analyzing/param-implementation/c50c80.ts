import { safeLog10 } from '../../math/safeLog10';
import { e50Calc, e80Calc, l50Calc, l80Calc } from '../early-late-fractions';
import { createOctaveBandParameterImplementation } from '../param-implementation';

export const C50 = createOctaveBandParameterImplementation(
  'c50',
  'omnidirectional',
  bands =>
    bands.collect(band => {
      const e50Sum = e50Calc(band).squaredSum();
      const l50Sum = l50Calc(band).squaredSum();

      return 10 * safeLog10(e50Sum / l50Sum);
    }),
  octaveBandValues =>
    (octaveBandValues.band(500) + octaveBandValues.band(1000)) / 2
);

export const C80 = createOctaveBandParameterImplementation(
  'c80',
  'omnidirectional',
  bands =>
    bands.collect(band => {
      const e80Sum = e80Calc(band).squaredSum();
      const l80Sum = l80Calc(band).squaredSum();

      return 10 * safeLog10(e80Sum / l80Sum);
    }),
  octaveBandValues =>
    (octaveBandValues.band(500) + octaveBandValues.band(1000)) / 2
);
