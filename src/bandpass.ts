import { add, Complex, divide, multiply, pow, sqrt, subtract } from '@iamsquare/complex.js';
import { absComplex } from './absComplex';
import { freqz } from './freqz';


type Coefficients = {
  feedbacks: number[][];
  gains: number[];
}

/**
 * Calculates coefficients for a cascade of biquad IIR filters to model a higher-order IIR filter.
 * 
 * @copyright Neil Robertson https://www.dsprelated.com/showarticle/1257.php
 * 
 * @param order 
 * @param f1 
 * @param f2 
 * @param fs 
 */
export function bandpass(order: number, f1: number, f2: number, fs: number): Coefficients {
  if (order % 2 !== 0) {
    throw new Error("only filters with an even order are supported")
  }

  // TODO: sanity checks on f1, f2

  const numberOfBiquads = order / 2;

  // continuous frequency variables
  const F1 = fs/Math.PI * Math.tan(Math.PI * f1 / fs);
  const F2 = fs/Math.PI * Math.tan(Math.PI * f2 / fs);
  const BW = F2 - F1;             // -3dB bandwith in Hz
  const F0 = Math.sqrt(F1 * F2);  // geometric mean frequency in Hz

  const k = [];
  const theta = [];
  const pLp = [];

  for (let i = 0; i < numberOfBiquads; i += 1) {
    k[i] = i + 1;
    theta[i] = (2 * k[i] - 1) * Math.PI / (2 * numberOfBiquads);
    pLp[i] = new Complex(-Math.sin(theta[i]), Math.cos(theta[i]));
  }

  const pa = [];
  const p = [];

  for (let i = 0; i < numberOfBiquads; i += 1) {
    const alpha = multiply(BW / F0 * 0.5, pLp[i]);
    const beta = sqrt(subtract(new Complex(1, 0), pow(multiply(BW / F0 * 0.5, pLp[i]), 2)));
    pa[i] = multiply(2 * Math.PI * F0 ,add(alpha, multiply(beta, new Complex(0, 1))));
    p[i] = divide(add(new Complex(1, 0), divide(pa[i], 2 * fs)), subtract(new Complex(1, 0), divide(pa[i], 2*fs)));
  }
  
  
  const a = [];
  
  for (let i = 0; i < numberOfBiquads; i += 1) {
    const a1 = -2 * p[i].getRe();
    const a2 = absComplex(p[i])**2;
    a[i] = [1, a1, a2];
  }

  const b = [1, 0, -1];
  const f0 = Math.sqrt(f1 * f2);
  const K = [];

  for (let i = 0; i < numberOfBiquads; i += 1) {
    const aa = a[i];
    // freqz(b, a, f, fs)
    const h = freqz(b, aa, [f0, f0], fs);
    K[i] = 1 / absComplex(h[0])
  }

  return {
    feedbacks: a,
    gains: K,
  }
}
