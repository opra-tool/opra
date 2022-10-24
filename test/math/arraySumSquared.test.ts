/* eslint-disable import/extensions */
import { expect } from '@esm-bundle/chai';
import { arraySumSquared } from '../../src/math/arraySumSquared';

it('should calculate the sum of all array elements squared', () => {
  const actual = arraySumSquared(new Float64Array([1.56, 4.68, 10, 5.12]));

  expect(actual).to.be.closeTo(150.5504, 1e-10);
});
