import {  Complex } from "@iamsquare/complex.js";

// TODO: N + padding
export function fft(x: Float32Array): Complex[] {
  // TODO: move to a global place
  // await initWasm();

  const result: number[] = []; // wasmFft(x);

  const ret = [];
  for (let i = 0; i < result.length; i += 2) {
    ret.push(new Complex(result[i], result[i + 1]));
  }
  return ret;
}

// TODO: N + padding
export function ifft(x: Float32Array): Complex[] {
  // TODO: move to a global place
  // await initWasm();

  const result: number[] = []; // wasmIfft(x);

  const ret = [];
  for (let i = 0; i < result.length; i += 2) {
    ret.push(new Complex(result[i], result[i + 1]));
  }
  return ret;
}
