import { Complex, multiply, add } from "@iamsquare/complex.js";

export function polyval(p: number[], x: Complex[]): Complex[] {

  const nc = p.length;

  const y = x.map(() => new Complex(p[0]));

  for (let i = 1; i < nc; i += 1) {
    for (let ii = 0; ii < y.length; ii += 1) {
      y[ii] = add(multiply(x[ii], y[ii]), new Complex(p[i]));
    }
  }

  return y;
}
