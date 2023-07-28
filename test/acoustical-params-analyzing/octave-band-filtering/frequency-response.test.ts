import { expect } from '@esm-bundle/chai';
import { frequencyResponse } from '../../../src/acoustical-param-analyzing/octave-band-filtering/frequency-response';

it('throws when given coefficients not matching in length', () => {
  const anyNumber = 0;
  expect(() =>
    frequencyResponse([1, 1, 1], [1, 1], anyNumber, anyNumber)
  ).to.throw();
});

it('calculates the frequency response of a digital IIR-filter at evaluation frequencies', () => {
  // coefficients for a 2nd order bandpass filter designed using matlab:
  // designfilt(
  //   'bandpassiir',
  //   'FilterOrder', 2,
  //   'HalfPowerFrequency1', 100,
  //   'HalfPowerFrequency2', 200,
  //   'SampleRate', 48000)
  //
  const feedforward = [0.006502518659231, 0, -0.006502518659231];
  const feedbackward = [1, -1.986654501323761, 0.986994962681538];

  expect(
    20 *
      Math.log10(
        frequencyResponse(
          feedforward,
          feedbackward,
          Math.sqrt(100 * 200),
          48000
        )
      )
  ).to.be.closeTo(0, 0.015);
  expect(
    20 * Math.log10(frequencyResponse(feedforward, feedbackward, 100, 48000))
  ).to.be.closeTo(-3, 0.015);
  expect(
    20 * Math.log10(frequencyResponse(feedforward, feedbackward, 200, 48000))
  ).to.be.closeTo(-3, 0.015);
});
