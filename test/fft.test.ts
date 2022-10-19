import { expect } from '@esm-bundle/chai';
import { Complex } from '@iamsquare/complex.js';
import { fft } from "../src/fft";

it('should calculate the discrete fourier transform', () => {  
  const x = new Float32Array([
    1.34858447511152e-11,
    8.07409672135187e-11,
    2.38634549470470e-10,
    5.00423745946381e-10,
    8.84944676340208e-10,
    1.42231553892638e-09,
  ]);
  const expected = [
    new Complex(3.14054529e-09, 0),
    new Complex(-2.97199300e-10, 1.72155859e-09),
    new Complex(-7.99408241e-10, 6.02116634e-10),
    new Complex(-8.66415141e-10, -3.09925105e-24),
    new Complex(-7.99408241e-10, -6.02116634e-10),
    new Complex(-2.97199300e-10, -1.72155859e-09)
  ];

  // const lala = [];
  // for (let i = 0; i < 1024; i += 1) {
  //   lala[i] = Math.random();
  // }

  // const x = new Float32Array(lala)

  const t0 = Date.now();
  const actual = fft(x);
  console.log("elapsed: ", Date.now() - t0);

  expect(actual.length).to.equal(expected.length);
  for (let i = 0; i < actual.length; i += 1) {
    expect(actual[i].getRe()).to.be.closeTo(expected[i].getRe(), 1.0e-10);
    expect(actual[i].getIm()).to.be.closeTo(expected[i].getIm(), 1.0e-10);
  }
});
