/* eslint-disable import/extensions */
import { expect } from '@esm-bundle/chai';
import { fitCurve } from '../../src/math/fitCurve';

it('should calculate the absolute of a complex number', () => {
  const x = new Float64Array([1, 1.2, 1.5, 2, 2.3, 2.5, 2.7, 3, 3.1, 3.2, 3.6]);
  const y = new Float64Array([1.5, 2, 3, 1.8, 2.7, 4.7, 7.1, 10, 6, 5, 8.9]);

  const { a, b } = fitCurve(x, y);

  expect(a).to.be.closeTo(-1.85, 1e-2);
  expect(b).to.be.closeTo(2.8, 1e-2);
});
