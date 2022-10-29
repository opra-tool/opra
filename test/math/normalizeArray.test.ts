import { expect } from '@esm-bundle/chai';
import { normalizeArray } from '../../src/math/normalizeArray';

it('should normalize the array', () => {
  const actual = normalizeArray(new Float64Array([4, 2, 1.87, 2.04]), 2);

  expect(actual).to.deep.equal(new Float64Array([2, 1, 0.935, 1.02]));
});
