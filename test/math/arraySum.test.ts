import { expect } from '@esm-bundle/chai';
import { arraySum } from '../../src/math/arraySum';

it('should calculate the sum of an array', () => {
  const actual = arraySum(new Float64Array([1.56, 4.68, 10, 5.12]));

  expect(actual).to.be.closeTo(21.36, 1e-10);
});
