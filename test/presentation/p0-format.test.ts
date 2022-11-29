import { expect } from '@esm-bundle/chai';
import { formatP0 } from '../../src/presentation/p0-format';

it('formats p0', () => {
  expect(formatP0(1)).equal('1');
  expect(formatP0(0.01)).equal('0.01');
  expect(formatP0(0.001)).equal('1e-3');
  expect(formatP0(0.00000001)).equal('1e-8');
});
