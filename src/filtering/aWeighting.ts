import { Complex, conjugate, multiply } from '@iamsquare/complex.js';
import { fft } from '../math/fft';
import { ifft } from '../math/ifft';

export function aWeightAudioSignal(
  samples: Float32Array,
  fs: number
): Float32Array {
  const len = samples.length;

  const numUniquePoints = Math.ceil((len + 1) / 2);

  const x = fft(samples);

  const X = x.slice(0, numUniquePoints);

  const f = new Float64Array(numUniquePoints);
  for (let i = 0; i < numUniquePoints; i += 1) {
    f[i] = ((i * fs) / len) ** 2;
  }

  const c1 = 12194.217 ** 2;
  const c2 = 20.598997 ** 2;
  const c3 = 107.65265 ** 2;
  const c4 = 737.86223 ** 2;

  const numerator = f.map(v => c1 * v ** 2);
  const denominator = f.map(
    v => (v + c2) * Math.sqrt((v + c3) * (v + c4)) * (v + c1)
  );
  const A: Complex[] = [];
  for (let i = 0; i < numUniquePoints; i += 1) {
    A.push(new Complex((1.2589 * numerator[i]) / denominator[i], 0));
  }

  const XA: Complex[] = [];
  for (let i = 0; i < numUniquePoints; i += 1) {
    XA.push(multiply(X[i], A[i]));
  }

  const XAFull = [...XA, ...XA.slice(0, -1).reverse().map(conjugate)];

  return ifft(
    XAFull,
    samples.length % 2 === 0 ? samples.length * 2 : samples.length * 2 - 1
  );
}
