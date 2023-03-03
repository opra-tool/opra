import { expect } from '@esm-bundle/chai';
import { expectArraysApproximatelyEqual } from './arrays-approx-equality';

it('passes when given two equal arrays', () => {
  const a = new Float32Array([0.1, 0.2, 0.3, 0.4]);
  const b = new Float32Array([0.1, 0.2, 0.3, 0.4]);

  expect(() => expectArraysApproximatelyEqual(a, b, 0)).to.not.throw();
});

it('fails when given arrays are not the same length', () => {
  const a = new Float32Array(1);
  const b = new Float32Array(2);

  expect(() => expectArraysApproximatelyEqual(a, b, 0)).to.throw();
});

it('fails when given arrays have differences greater than given epsilon', () => {
  const a = new Float32Array([0.1, 0.2, 0.2, 0.1]);
  const b = new Float32Array([0.4, 0.2, 0.2, 0.4]);

  expect(() => expectArraysApproximatelyEqual(a, b, 0)).to.throw();
});

it('passes when given arrays have differences equal to or smaller than given epsilon', () => {
  const a = new Float32Array([0.1, 0.7, 0.22, 0.1]);
  const b = new Float32Array([0.11, 0.695, 0.23, 0.095]);

  expect(() => expectArraysApproximatelyEqual(a, b, 0.1)).to.not.throw();
});
