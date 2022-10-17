import { expect } from '@esm-bundle/chai';
import { Complex } from '@iamsquare/complex.js';
import { polyval } from '../src/polyval';

it('should calculate the value of a polynomial', () => {
  const polynome = [1,0,-1];
  const x = [
    new Complex(1, 0.009),
    new Complex(1, 0.009),
  ];

  const h = polyval(polynome, x);

  expect(h.length).to.equal(2);
  expect(h[0].getRe()).to.be.closeTo(-0.000081000000000, 1.0e-05);
  expect(h[0].getIm()).to.be.closeTo(0.018000000000000, 1.0e-03);
  expect(h[1].getRe()).to.be.closeTo(-0.000081000000000, 1.0e-05);
  expect(h[1].getIm()).to.be.closeTo(0.018000000000000, 1.0e-03);
});

it('should calculate the value of a polynomial 2', () => {
  const polynome = [1, -1.995756685826569, 0.995905042790672];
  const x = [
    new Complex(1, 0.009),
    new Complex(1, 0.009),
  ];

  const h = polyval(polynome, x);

  expect(h.length).to.equal(2);
  expect(h[0].getRe()).to.be.closeTo(6.735696410309355e-05, 1.0e-06);
  expect(h[0].getIm()).to.be.closeTo(3.818982756088017e-05, 1.0e-06);
  expect(h[1].getRe()).to.be.closeTo(6.735696410309355e-05, 1.0e-06);
  expect(h[1].getIm()).to.be.closeTo(3.818982756088017e-05, 1.0e-06);
});
