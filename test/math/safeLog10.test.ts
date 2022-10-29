import { expect } from '@esm-bundle/chai';
import { safeLog10 } from '../../src/math/safeLog10';

it('should throw an error when given a negative number', () => {
  expect(() => safeLog10(-1)).to.throw();
});

it('should return the log 10 if given a positive number', () => {
  expect(safeLog10(40)).to.equal(Math.log10(40));
});
