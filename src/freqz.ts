import { Complex, divide, exp, multiply } from "@iamsquare/complex.js";
import { polyval } from "./polyval";

// TODO: docs, cleanup
export function freqz(b: number[], a: number[], nfft: number[], fs: number) {
  // TODO: if (a.length === 1) ???
  return iirfreqz(b, a, fs, nfft);
}

function iirfreqz(b: number[], a: number[], fs: number, w: number[]) {
  if (a.length !== b.length) {
    throw new Error('TODO');
  }

  const digw = [];
  const s = [];

  for (let i = 0; i < w.length; i += 1) {
    digw[i] = 2 * Math.PI * w[i] / fs;
    s[i] = exp(multiply(new Complex(0, 1), digw[i]));
  }

  const poly1 = polyval(b, s);
  const poly2 = polyval(a, s);

  return [
    divide(poly1[0], poly2[0]),
    divide(poly1[1], poly2[1])
  ];
}
