import { expect } from '@esm-bundle/chai';
import { freqz } from '../src/freqz';

it('should calculate the value of a polynomial', () => {
  const fs = 44100;
  const f0 = 63.095734448019336;
  const b = [1, 0, -1];
  const aa = [1, -1.995756685826569, 0.995905042790672];

  const h = freqz(b, aa, [f0, f0], fs);

  expect(h.length).to.equal(2);
  expect(h[0].getRe()).to.be.closeTo(1.114257653176229e+02, 1.0e-03);
  expect(h[0].getIm()).to.be.closeTo(2.049518619002951e+02, 1.0e-03);
  expect(h[1].getRe()).to.be.closeTo(1.114257653176229e+02, 1.0e-03);
  expect(h[1].getIm()).to.be.closeTo(2.049518619002951e+02, 1.0e-03);
});
