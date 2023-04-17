import { expect } from '@esm-bundle/chai';
import {
  arrayMax,
  arrayMaxAbs,
  arraySquaredSum,
  arraySum,
} from '../../src/math/arrays';

it('should calculate the sum of an array', () => {
  const actual = arraySum(new Float64Array([1.56, 4.68, 10, 5.12]));

  expect(actual).to.be.closeTo(21.36, 1e-10);
});

it('should calculate the sum of an array after squaring all elements', () => {
  const actual = arraySquaredSum(new Float64Array([2, 4, 5]));

  expect(actual).to.equal(45);
});

it('should return the largest array element', () => {
  const actual = arrayMax(new Float64Array([1.004, 4.554, 4.552, 2.04]));

  expect(actual).to.equal(4.554);
});

it('should return the largest array element', () => {
  const actual = arrayMaxAbs(new Float64Array([1.004, -6.554, 4.552, -2.04]));

  expect(actual).to.equal(6.554);
});
