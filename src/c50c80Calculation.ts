import { arraySumSquared } from './math/arraySumSquared';
import { safeLog10 } from './math/safeLog10';

type EarlyLateFractions = {
  e50: Float64Array;
  l50: Float64Array;
  e80: Float64Array;
  l80: Float64Array;
};

type C50C80 = {
  c50: number;
  c80: number;
};

export function c50c80Calculation({
  e50,
  l50,
  e80,
  l80,
}: EarlyLateFractions): C50C80 {
  const e50Sum = arraySumSquared(e50);
  const l50Sum = arraySumSquared(l50);
  const e80Sum = arraySumSquared(e80);
  const l80Sum = arraySumSquared(l80);

  const c50 = 10 * safeLog10(e50Sum / l50Sum);
  const c80 = 10 * safeLog10(e80Sum / l80Sum);

  return {
    c50,
    c80,
  };
}
