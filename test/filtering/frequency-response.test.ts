import { expect } from '@esm-bundle/chai';
import { frequencyResponse } from '../../src/filtering/frequency-response';

it('calculates the frequency response vector of a digital filter at specfied frequencies', () => {
  const sampleRate = 44100;
  const frequencies = [60, 8000];
  const numerator = [1, 0, -1];
  const denominator = [1, -2, 1];

  const h = frequencyResponse(numerator, denominator, frequencies, sampleRate);

  const acceptedError = 1e-15;

  expect(h.length).to.equal(2);
  expect(h[0].getRe()).closeTo(-1.53365442896931e-12, acceptedError);
  expect(h[0].getIm()).closeTo(-2.339563415848686e2, acceptedError);
  expect(h[1].getRe()).closeTo(0, acceptedError);
  expect(h[1].getIm()).closeTo(-1.560470622190107, acceptedError);
});
