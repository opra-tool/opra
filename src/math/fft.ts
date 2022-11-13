import { Complex } from '@iamsquare/complex.js';
import { fft_flat as wasmFftFlat } from 'wasm-raqi-online-toolbox';
import { complexFlatFormIntoObjectForm } from './wasm';

// TODO: convert to Float32Array?
export function fft(x: Float64Array): Complex[] {
  const flatOutput = wasmFftFlat(x);

  return complexFlatFormIntoObjectForm(flatOutput);
}
