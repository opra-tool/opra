import { safeLog10 } from '../math/safeLog10';
import { IRBuffer } from './buffer';
import { e50Calc, l50Calc, e80Calc, l80Calc } from './early-late-fractions';

export function c50Calc(buffer: IRBuffer): number {
  buffer.assertMono();

  const e50Sum = e50Calc(buffer).sum();
  const l50Sum = l50Calc(buffer).sum();

  return 10 * safeLog10(e50Sum / l50Sum);
}

export function c80Calc(buffer: IRBuffer): number {
  buffer.assertMono();

  const e80Sum = e80Calc(buffer).sum();
  const l80Sum = l80Calc(buffer).sum();

  return 10 * safeLog10(e80Sum / l80Sum);
}
