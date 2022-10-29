/* eslint-disable import/extensions */
import { Complex } from '@iamsquare/complex.js';
import { ifft_flat as wasmIfftFlat } from 'wasm-raqi-online-toolbox';
import {
  complexObjectFormIntoFlatForm,
  complexFlatFormIntoObjectForm,
} from './wasm';

export function ifft(x: Complex[]): Complex[] {
  const flatInput = complexObjectFormIntoFlatForm(x);

  const flatOutput = wasmIfftFlat(flatInput);

  return complexFlatFormIntoObjectForm(flatOutput);
}
