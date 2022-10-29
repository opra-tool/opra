import { Complex } from '@iamsquare/complex.js';

export function complexObjectFormIntoFlatForm(array: Complex[]): Float64Array {
  const flattened = new Float64Array(array.length * 2);

  for (let i = 0; i < array.length; i += 1) {
    flattened[i * 2] = array[i].getRe();
    flattened[i * 2 + 1] = array[i].getIm();
  }

  return flattened;
}

export function complexFlatFormIntoObjectForm(array: Float64Array): Complex[] {
  const objectForm: Complex[] = [];

  for (let i = 0; i < array.length; i += 2) {
    objectForm.push(new Complex(array[i], array[i + 1]));
  }

  return objectForm;
}
