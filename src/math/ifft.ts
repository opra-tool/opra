import { Complex } from '@iamsquare/complex.js';
import { ifft_flat as wasmIfftFlat } from 'wasm-raqi-online-toolbox';
import { complexObjectFormIntoFlatForm } from './wasm';

export function ifft(x: Complex[], length: number): Float32Array {
  const flatInput = complexObjectFormIntoFlatForm(x);

  return wasmIfftFlat(flatInput, length);
}
