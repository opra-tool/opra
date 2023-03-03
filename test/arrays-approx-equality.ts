import { expect } from '@esm-bundle/chai';

export function expectArraysApproximatelyEqual(
  actual: Float32Array,
  expected: Float32Array,
  epsilon: number
) {
  expect(actual.length).to.equal(expected.length);

  for (let i = 0; i < actual.length; i += 1) {
    expect(actual[i]).to.be.approximately(
      expected[i],
      epsilon,
      `arrays not approximately equal at index ${i}`
    );
  }
}
