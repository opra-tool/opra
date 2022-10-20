import initWasm, { fft as wasmFft, ifft as wasmIfft } from "wasm-raqi-online-toolbox";
import {  Complex } from "@iamsquare/complex.js";

// TODO: N + padding
export async function fft(x: Float32Array): Promise<Complex[]> {
  // TODO: move to a global place
  await initWasm();

  const result = wasmFft(x);

  const ret = [];
  for (let i = 0; i < result.length; i += 2) {
    ret.push(new Complex(result[i], result[i + 1]));
  }
  return ret;
}

// TODO: N + padding
export async function ifft(x: Float32Array): Promise<Complex[]> {
  // TODO: move to a global place
  await initWasm();

  const result = wasmIfft(x);

  const ret = [];
  for (let i = 0; i < result.length; i += 2) {
    ret.push(new Complex(result[i], result[i + 1]));
  }
  return ret;
}
