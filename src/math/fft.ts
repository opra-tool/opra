/* eslint-disable import/extensions */
import { Complex } from '@iamsquare/complex.js';
import { fft_flat as wasmFftFlat } from 'wasm-raqi-online-toolbox';
import { complexFlatFormIntoObjectForm } from './wasm';

export function fft(x: Float64Array): Complex[] {
  const flatOutput = wasmFftFlat(x);

  return complexFlatFormIntoObjectForm(flatOutput);
}
