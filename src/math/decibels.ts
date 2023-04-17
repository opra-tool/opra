import { log } from '@iamsquare/complex.js';
import { safeLog10 } from './safeLog10';

export function meanDecibel(...values: number[]): number {
  let sum = 0;
  for (const value of values) {
    sum += 10 ** (value / 20);
  }

  return 20 * safeLog10(sum / values.length);
}

export function meanDecibelEnergetic(...values: number[]): number {
  let sum = 0;
  for (const value of values) {
    sum += 10 ** (value / 10);
  }

  return 10 * safeLog10(sum / values.length);
}

export function addDecibel(...values: number[]): number {
  let sum = 0;
  for (const value of values) {
    sum += 10 ** (value / 20);
  }

  return 20 * safeLog10(sum);
}
