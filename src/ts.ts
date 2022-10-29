/* eslint-disable import/extensions */
import { arraySum } from './math/arraySum';

export function ts(input: Float64Array, fs: number): number {
  let out = 0;
  for (let i = 0; i < input.length; i += 1) {
    out += (i / fs) * input[i];
  }

  return out / arraySum(input);
}
