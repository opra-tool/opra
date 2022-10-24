/* eslint-disable import/extensions */
import { arraySum } from './arraySum';

type Coefficients = {
  a: number;
  b: number;
};

/**
 * Solves y = a + bx for a given set of points
 *
 * TODO: use Point({ x, y }) API?
 *
 * @param x
 * @param y
 */
export function fitCurve(x: Float64Array, y: Float64Array): Coefficients {
  // TODO: check for lengths

  const avgX = arraySum(x) / x.length;
  const avgY = arraySum(y) / y.length;

  let sum1 = 0;
  let sum2 = 0;
  for (let i = 0; i < x.length; i += 1) {
    sum1 += (x[i] - avgX) * (y[i] - avgY);
    sum2 += (x[i] - avgX) ** 2;
  }

  const b = sum1 / sum2;
  const a = -b * avgX + avgY;

  return { a, b };
}
