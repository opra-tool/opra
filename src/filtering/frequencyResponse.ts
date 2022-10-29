import { Complex, divide, exp, multiply } from '@iamsquare/complex.js';
import { evaluatePolynomial } from '../math/evaluatePolynomial';

/**
 * Calculate the frequency response of a digital filter for given evaluation frequencies.
 * The digital filter is defined by an array of numerator and denominator values.
 *
 * @param numerator
 * @param denominator
 * @param evaluationFrequencies
 * @param sampleRate
 * @returns
 */
export function frequencyResponse(
  numerator: number[],
  denominator: number[],
  evaluationFrequencies: number[],
  sampleRate: number
) {
  if (denominator.length !== numerator.length) {
    throw new Error('TODO');
  }

  const x = evaluationFrequencies.map(freq => {
    const digw = (2 * Math.PI * freq) / sampleRate;

    return exp(multiply(new Complex(0, 1), digw));
  });

  const polyNum = evaluatePolynomial(numerator, x);
  const polyDen = evaluatePolynomial(denominator, x);

  return [divide(polyNum[0], polyDen[0]), divide(polyNum[1], polyDen[1])];
}
