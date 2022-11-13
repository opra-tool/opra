/**
 * Calculate the arithmetic mean of an arbitrary array of numbers.
 *
 * @param values An array of numbers
 * @returns The arithmetic mean
 */
export function mean(...values: number[]) {
  let sum = 0;

  for (const value of values) {
    sum += value;
  }

  return sum / values.length;
}

/**
 * Calculate the arithmetic mean of two arrays by taking the mean of entries in order.
 * Arrays a and b must have the same length.
 *
 * The resulting array has the form:
 *
 * [
 *  mean(a1, b1),
 *  mean(a2, b2),
 *  ...
 *  mean(an, bn)
 * ]
 *
 * @param a
 * @param b
 * @returns The array of means
 */
export function arraysMean(a: number[], b: number[]) {
  if (a.length !== b.length) {
    throw new Error('expected arrays to have the same length');
  }

  const res = new Array(a.length);
  for (let i = 0; i < a.length; i += 1) {
    res[i] = (a[i] + b[i]) / 2;
  }

  return res;
}
