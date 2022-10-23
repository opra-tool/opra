import { expect } from '@esm-bundle/chai';
import { Complex } from '@iamsquare/complex.js';
import { absComplex } from '../../src/math/absComplex';

it('should calculate the absolute of a complex number', () => {
  const num = new Complex(3, 4);

  const abs = absComplex(num);
  
  expect(abs).to.equal(5);
});
