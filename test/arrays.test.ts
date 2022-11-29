import { expect } from '@esm-bundle/chai';
import { isFreeOfNullValues, mapArrayParam } from '../src/arrays';

it('detects null values in an array', () => {
  expect(isFreeOfNullValues([1, null, 1])).equal(false);
  expect(isFreeOfNullValues([1, 1, 1])).equal(true);
});

it('maps an array parameter', () => {
  expect(mapArrayParam([{ id: 1 }, { id: 2 }], 'id')).deep.equal([1, 2]);
});
