import { expect } from '@esm-bundle/chai';
import { arrayMax } from '../../src/math/arrayMax';

it('should return the largest array element', () => {
  const actual = arrayMax(new Float64Array([1.004, 4.554, 4.552, 2.04]));

  expect(actual).to.equal(4.554);
});
