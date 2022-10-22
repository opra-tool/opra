import initWasm, { xcorr as wasmXcorr } from "wasm-raqi-online-toolbox";


export async function xcorr(x: Float32Array, y: Float32Array): Promise<Float32Array> {
  if (x.length !== y.length) {
    throw new Error('x and y should be of samle length');
  }

  // TOOD: move to global place
  await initWasm();

  return wasmXcorr(x, y, findTransformLength(x.length));
}

function findTransformLength(m: number): number {
  let m2 = m * 2;

  while(true) {
    let r = m2;
    for(const p of [2, 3, 5, 7]) {
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
