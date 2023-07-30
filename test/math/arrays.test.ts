import { expect } from '@esm-bundle/chai';
import {
  arrayMax,
  arrayMaxAbs,
  arraySquaredSum,
  arraySum,
} from '../../src/math/arrays';

it('should calculate the sum of an array', () => {
  const actual = arraySum(new Float32Array([1.56, 4.68, 10, 5.12]));

  expect(actual).to.be.closeTo(21.36, 1e-5);
});

it('should calculate the sum of an array after squaring all elements', () => {
  const actual = arraySquaredSum(new Float32Array([2, 4, 5]));

  expect(actual).to.equal(45);
});

it('should return the largest array element', () => {
  const actual = arrayMax(new Float32Array([1.004, 4.554, 4.552, 2.04]));

  expect(actual).to.be.closeTo(4.554, 1e-5);
});

it('should return the largest array element', () => {
  const actual = arrayMaxAbs(new Float32Array([1.004, -6.554, 4.552, -2.04]));

  expect(actual).to.be.closeTo(6.554, 1e-5);
});
