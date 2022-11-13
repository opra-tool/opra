import { expect } from '@esm-bundle/chai';
import { arraysMean, mean } from '../../src/math/mean';

it('should return the average of an arbitrary count of numbers', () => {
  expect(mean(1, 2, 3, 4)).to.equal(2.5);
});

it('should throw when given arrays of different lengths', () => {
  expect(() => arraysMean([1], [1, 2])).to.throw();
});

it('should return an array of averages from two arrays', () => {
  const array1 = [1, 2, 3, 4];
  const array2 = [2, 4, 6, 8];

  const result = arraysMean(array1, array2);

  expect(result).to.deep.equal([1.5, 3, 4.5, 6]);
});
