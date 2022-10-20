import { expect } from '@esm-bundle/chai';
import { Complex } from '@iamsquare/complex.js';
import { fft, ifft } from "../src/fourier";

it('should calculate the discrete fourier transform', async () => {  
  const x = new Float32Array([
    0.1348584,
    0.8074096,
    2.3863454,
    5.0042374,
    8.8494467,
    1.5223155,
  ]);
  const expected = [
    new Complex(18.704613, 0),
    new Complex(-9.3224125, 6.21633658374761),
    new Complex(-1.6436628, -4.97808324231685),
    new Complex(4.036688, 0),
    new Complex(-1.6436628, 4.97808324231685),
    new Complex(-9.3224125,  -6.21633658374761)
  ];

  const actual = await fft(x);

  expect(actual.length).to.equal(expected.length);
  for (let i = 0; i < actual.length; i += 1) {
    expect(actual[i].getRe()).to.be.closeTo(expected[i].getRe(), 1.0e-2);
    expect(actual[i].getIm()).to.be.closeTo(expected[i].getIm(), 1.0e-2);
  }
});

it('should calculate the inverse discrete fourier transform', async () => {  
  const x = new Float32Array([
    0.1348584,
    0.8074096,
    2.3863454,
    5.0042374,
    8.8494467,
    1.5223155,
  ]);

  const expected = [
    new Complex(3.1174355, 0),
    new Complex(-1.55373541666667, -1.03605609729127),
    new Complex(-0.2739438, 0.829680540386142),
    new Complex(0.672781333333333, 0),
    new Complex(-0.2739438, -0.829680540386142),
    new Complex(-1.55373541666667, 1.03605609729127)
  ];

  const actual = await ifft(x);

  expect(actual.length).to.equal(expected.length);
  for (let i = 0; i < actual.length; i += 1) {
    expect(actual[i].getRe()).to.be.closeTo(expected[i].getRe(), 1.0e-2);
    expect(actual[i].getIm()).to.be.closeTo(expected[i].getIm(), 1.0e-2);
  }
});
