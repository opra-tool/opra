import { expect } from '@esm-bundle/chai';
import { arrayCumulativeSum } from '../../src/math/arrayCumulativeSum';

it('should calculate the cumulative sum of the array', () => {
  const actual = arrayCumulativeSum(new Float32Array([5, 10, 3, 2]));

  expect(actual).to.deep.equal(new Float64Array([5, 15, 18, 20]));
});
