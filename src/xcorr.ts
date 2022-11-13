import { xcorr as wasmXcorr } from 'wasm-raqi-online-toolbox';

export function xcorr(x: Float32Array, y: Float32Array): Float64Array {
  if (x.length !== y.length) {
    throw new Error('x and y should be of same length');
  }

  // TODO: convert wasm function to f32?
  return wasmXcorr(
    new Float64Array(x),
    new Float64Array(y),
    findTransformLength(x.length)
  );
}

function findTransformLength(m: number): number {
  let m2 = m * 2;

  while (true) {
    let r = m2;
    for (const p of [2, 3, 5, 7]) {
      while (r > 1 && mod(r, p) === 0) {
        r /= p;
      }
    }
    if (r === 1) {
      break;
    }
    m2 += 1;
  }

  return m2;
}

function mod(x: number, y: number): number {
  return x - Math.floor(x / y) * y;
}
