import {
  add,
  Complex,
  divide,
  multiply,
  pow,
  sqrt,
  subtract,
} from '@iamsquare/complex.js';
import { absComplex } from '../math/absComplex';
import { frequencyResponse } from './frequency-response';

type Coefficients = {
  feedbacks: number[][];
  gains: number[];
};

/**
 * Calculates coefficients for a cascade of biquad IIR filters to model a higher-order IIR filter.
 *
 * @copyright Neil Robertson https://www.dsprelated.com/showarticle/1257.php
 *
 * @param order
 * @param f1
 * @param f2
 * @param sampleRate
 */
export function bandpass(
  order: number,
  f1: number,
  f2: number,
  sampleRate: number
): Coefficients {
  if (order % 2 !== 0) {
    throw new Error('only filters with an even order are supported');
  }

  // TODO: sanity checks on f1, f2

  const numberOfBiquads = order / 2;

  // continuous frequency variables
  const F1 = (sampleRate / Math.PI) * Math.tan((Math.PI * f1) / sampleRate);
  const F2 = (sampleRate / Math.PI) * Math.tan((Math.PI * f2) / sampleRate);
  const BW = F2 - F1; // -3dB bandwith in Hz
  const f0 = Math.sqrt(f1 * f2);
  const F0 = Math.sqrt(F1 * F2);

  const b = [1, 0, -1];
  const feedbacks = new Array(numberOfBiquads);
  const gains = new Array(numberOfBiquads);

  for (let i = 0; i < numberOfBiquads; i += 1) {
    const k = i + 1;
    const theta = ((2 * k - 1) * Math.PI) / (2 * numberOfBiquads);

    const pLp = new Complex(-Math.sin(theta), Math.cos(theta));

    const alpha = multiply((BW / F0) * 0.5, pLp);
    const beta = sqrt(
      subtract(new Complex(1, 0), pow(multiply((BW / F0) * 0.5, pLp), 2))
    );
    const pa = multiply(
      2 * Math.PI * F0,
      add(alpha, multiply(beta, new Complex(0, 1)))
    );
    const p = divide(
      add(new Complex(1, 0), divide(pa, 2 * sampleRate)),
      subtract(new Complex(1, 0), divide(pa, 2 * sampleRate))
    );

    const a1 = -2 * p.getRe();
    const a2 = absComplex(p) ** 2;
    feedbacks[i] = [1, a1, a2];

    const h = frequencyResponse(b, feedbacks[i], [f0, f0], sampleRate);
    gains[i] = 1 / absComplex(h[0]);
  }

  return {
    feedbacks,
    gains,
  };
}
