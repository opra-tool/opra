import { expect } from '@esm-bundle/chai';
import initWasm from "wasm-raqi-online-toolbox";
import { xcorr } from '../src/xcorr';


it('should throw error when given two arrays of different lengths', () => {
  expect(() => xcorr(new Float64Array([1, 2, 3]), new Float64Array([1, 2]))).to.throw();
});

it('should calculate x correlation', async () => {
  await initWasm();
  
  const left = new Float64Array([
    0.134858400000000,	0.807409600000000,	2.38634540000000,	5.00423740000000,	8.84944670000000,	1.52231550000000
  ]);
  const right = new Float64Array([
    0.137858400000000,	1.00740960000000,	2.39834540000000,	5.74237400000000,	8.84944670000000,	1.72231550000000
  ]);
  const expected = new Float64Array([
    0.232268712625209,	2.58403629177608,	12.0295752608836,	34.6965969824716,	75.3018638901365,	116.226081271593,	78.8057077315741,	35.3360292886176,	13.2559320982262,	2.75356581187609,	0.209863979125207
  ]);

  const actual = await xcorr(left, right);

  expect(actual.length).to.equal(expected.length);
  for (let i = 0; i < expected.length; i += 1) {
    expect(actual[i]).to.be.closeTo(expected[i], 1.0e-3);
  }
});
