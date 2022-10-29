import { Complex, multiply, add } from '@iamsquare/complex.js';

/**
 * Evaluate a polynomial at every point in x
 *
 * @param polynomial
 * @param x
 * @returns
 */
export function evaluatePolynomial(
  polynomial: number[],
  x: Complex[]
): Complex[] {
  const y = x.map(() => new Complex(polynomial[0]));

  for (let i = 1; i < polynomial.length; i += 1) {
    for (let ii = 0; ii < y.length; ii += 1) {
      y[ii] = add(multiply(x[ii], y[ii]), new Complex(polynomial[i]));
    }
  }

  return y;
}
