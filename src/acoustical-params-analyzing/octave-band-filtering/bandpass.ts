import {
  add,
  Complex,
  divide,
  multiply,
  pow,
  sqrt,
  subtract,
} from '@iamsquare/complex.js';
import { absComplex } from '../../math/absComplex';
import { frequencyResponse } from './frequency-response';

const FILTER_ORDER = 6;
const Q_ONE_OCTAVE = Math.SQRT2;

type Coefficients = {
  feedback: number[];
  feedforward: number[];
};

/**
 * Calculates coefficients for a cascade of three 2nd order IIR filters, modelling a 6th order
 * IIR bandpass filter with a bandwith of one octave and the given center frequency.
 *
 * @copyright (in parts) Neil Robertson https://www.dsprelated.com/showarticle/1257.php
 */
export function octaveBandpassFilterCoefficients(
  centerFrequency: number,
  sampleRate: number
): Coefficients[] {
  const numberOfFilters = FILTER_ORDER / 2;

  const coefficients: Coefficients[] = [];

  const f1 = centerFrequency / Q_ONE_OCTAVE;
  const f2 = Q_ONE_OCTAVE * centerFrequency;

  // continuous frequency variables
  const F1 = (sampleRate / Math.PI) * Math.tan((Math.PI * f1) / sampleRate);
  const F2 = (sampleRate / Math.PI) * Math.tan((Math.PI * f2) / sampleRate);
  const BW = F2 - F1; // -3dB bandwith in Hz
  const F0 = Math.sqrt(F1 * F2);

  const b = [1, 0, -1];

  for (let i = 0; i < numberOfFilters; i++) {
    const k = i + 1;
    const theta = ((2 * k - 1) * Math.PI) / (2 * numberOfFilters);

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
    const feedback = [1, a1, a2];

    const gain =
      1 / frequencyResponse(b, feedback, centerFrequency, sampleRate);
    const feedforward = b.map(v => v * gain);

    coefficients.push({ feedback, feedforward });
  }

  return coefficients;
}
