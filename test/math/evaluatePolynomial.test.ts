import { expect } from '@esm-bundle/chai';
import { Complex } from '@iamsquare/complex.js';
import { evaluatePolynomial } from '../../src/math/evaluatePolynomial';

it('should calculate the value of a polynomial', () => {
  const polynome = [1, 0, -1];
  const x = [new Complex(1, 0.009), new Complex(1, 0.009)];

  const h = evaluatePolynomial(polynome, x);

  expect(h.length).to.equal(2);
  expect(h[0].getRe()).to.be.closeTo(-0.000081, 1.0e-5);
  expect(h[0].getIm()).to.be.closeTo(0.018, 1.0e-3);
  expect(h[1].getRe()).to.be.closeTo(-0.000081, 1.0e-5);
  expect(h[1].getIm()).to.be.closeTo(0.018, 1.0e-3);
});

it('should calculate the value of a polynomial 2', () => {
  const polynome = [1, -1.995756685826569, 0.995905042790672];
  const x = [new Complex(1, 0.009), new Complex(1, 0.009)];

  const h = evaluatePolynomial(polynome, x);

  expect(h.length).to.equal(2);
  expect(h[0].getRe()).to.be.closeTo(6.735696410309355e-5, 1.0e-6);
  expect(h[0].getIm()).to.be.closeTo(3.818982756088017e-5, 1.0e-6);
  expect(h[1].getRe()).to.be.closeTo(6.735696410309355e-5, 1.0e-6);
  expect(h[1].getIm()).to.be.closeTo(3.818982756088017e-5, 1.0e-6);
});
