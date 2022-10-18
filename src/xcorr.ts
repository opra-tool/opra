import { Complex, exp, multiply } from "@iamsquare/complex.js";

export function xcorr(x: Float32Array, y: Float32Array): Float32Array {
  const nx = x.length;
  const ny = y.length;
  if (nx !== ny) {
    throw new Error("only supports arrays of same length");
  }

  const maxlag = Math.max(nx, ny) - 1;

  // find transform length
  const m2 = findTransformLength(nx);
  const X = fft(x, m2);
  const Y = fft(y, m2);


  console.log({
    m2
  })

  // TODO: scaling??

  



  return new Float32Array();
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
