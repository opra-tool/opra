/* eslint-disable import/extensions */
import { expect } from '@esm-bundle/chai';
import { getAWeightingFilterCoefficients } from '../../src/digital_filters/a_weighting';

it('should calculate coefficients for a 6th order bandpass filter consisting of three biquad filters', () => {
  const fs = 44100;

  const { b, a } = getAWeightingFilterCoefficients(fs);

  expect(b).to.deep.equal(
    new Float64Array([
      0.255741125204258, -0.511482250408513, -0.255741125204263,
      1.02296450081703, -0.255741125204259, -0.511482250408515,
      0.255741125204257,
    ])
  );
  expect(a).to.deep.equal(
    new Float64Array([
      1, -4.01957618111583, 6.1894064429207, -4.45319890354412,
      1.42084294962188, -0.141825473830305, 0.00435117723349513,
    ])
  );
});
