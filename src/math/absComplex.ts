import { Complex } from '@iamsquare/complex.js';

export function absComplex(num: Complex): number {
  return Math.sqrt(num.getRe() ** 2 + num.getIm() ** 2);
}
