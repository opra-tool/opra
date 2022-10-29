import { expect } from '@esm-bundle/chai';
import { Complex } from '@iamsquare/complex.js';
import {
  complexObjectFormIntoFlatForm,
  complexFlatFormIntoObjectForm,
} from '../../src/math/wasm';

it('transforms a complex array from object form into flat form', () => {
  const array = [new Complex(1, 2), new Complex(2, 2), new Complex(10, 11)];

  const flattened = complexObjectFormIntoFlatForm(array);

  expect(flattened).to.deep.equal(new Float64Array([1, 2, 2, 2, 10, 11]));
});

it('transforms a complex array from flat form into object form', () => {
  const array = new Float64Array([1, 2, 2, 2, 10, 11]);

  const objectForm = complexFlatFormIntoObjectForm(array);

  expect(objectForm).to.deep.equal([
    new Complex(1, 2),
    new Complex(2, 2),
    new Complex(10, 11),
  ]);
});
