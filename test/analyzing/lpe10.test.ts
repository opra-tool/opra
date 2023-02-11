import { expect } from '@esm-bundle/chai';
import { calculateLpe10 } from '../../src/analyzing/lpe10';

it('calculates LPE10 when given air attenuation coefficients', async () => {
  const expected = [72.9, 75.9, 78.9, 81.8, 84.8, 87.8, 90.6, 92.8];
  const airCoeffs = [0, 0, 0, 0.003, 0.005, 0.01, 0.03, 0.105];

  const lpe10 = await calculateLpe10(airCoeffs);

  const roundedLpe10 = lpe10.map(v => Math.round(v * 10) / 10);

  expect(roundedLpe10).deep.equal(expected);
});
