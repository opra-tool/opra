import { expect } from '@esm-bundle/chai';
import { octaveBandpassFilterCoefficients } from '../../../src/acoustical-param-analyzing/octave-band-filtering/bandpass';
import { frequencyResponse } from '../../../src/acoustical-param-analyzing/octave-band-filtering/frequency-response';

it('calculates coefficients for a 6th order bandpass filter consisting of three biquad filters', () => {
  const sampleRate = 48000;
  const centerFrequency = 1000;
  const lowerCutoffFrequency = centerFrequency / Math.SQRT2;
  const upperCutoffFrequency = Math.SQRT2 * centerFrequency;

  const coefficients = octaveBandpassFilterCoefficients(
    centerFrequency,
    sampleRate
  );

  const responseLower = coefficients
    .map(c =>
      frequencyResponse(
        c.feedforward,
        c.feedback,
        lowerCutoffFrequency,
        sampleRate
      )
    )
    .reduce((acc, val) => acc * val, 1);
  const responseCenter = coefficients
    .map(c =>
      frequencyResponse(c.feedforward, c.feedback, centerFrequency, sampleRate)
    )
    .reduce((acc, val) => acc * val, 1);
  const responseUpper = coefficients
    .map(c =>
      frequencyResponse(
        c.feedforward,
        c.feedback,
        upperCutoffFrequency,
        sampleRate
      )
    )
    .reduce((acc, val) => acc * val, 1);

  const responseLowerDB = 20 * Math.log10(responseLower);
  const responseCenterDB = 20 * Math.log10(responseCenter);
  const responseUpperDB = 20 * Math.log10(responseUpper);

  expect(responseLowerDB).to.be.closeTo(-3, 0.015);
  expect(responseCenterDB).to.be.closeTo(0, 0.015);
  expect(responseUpperDB).to.be.closeTo(-3, 0.015);
});
