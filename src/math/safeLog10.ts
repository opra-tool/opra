/**
 * Performs a log10 that throws an error when given num is negativ.
 * Prevents NaN results.
 */
export function safeLog10(num: number): number {
  if (num < 0) {
    throw new Error('expected input to be positive');
  }

  return Math.log10(num);
}
