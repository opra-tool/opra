import { expect } from '@esm-bundle/chai';
import { arrayMaxAbs } from '../../src/math/arrayMaxAbs';

it('should return the largest array element', () => {
  const actual = arrayMaxAbs(new Float32Array([1.004, -6.554, 4.552, -2.04]));

  expect(actual).to.equal(6.554);
});
