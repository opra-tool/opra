import { add, Complex, exp, multiply } from "@iamsquare/complex.js";

function dft(x: Float32Array): Complex[] {
  const N = x.length;
  const n = [];
  const k = [];
  for (let i = 0; i < N; i += 1) {
    n[i] = i;
    k[i] = i;
  }

  const M: Complex[][] = [];

  for (let i = 0; i < n.length; i += 1) {
    M[i] = [];
    for (let ii = 0; ii < k.length; ii += 1) {
      M[i][ii] = exp(multiply(new Complex(0, -2), k[ii] * n[i] * Math.PI / N));
    }
  }

  const dot: Complex[] = [];
  // dot product
  for (let i = 0; i < M.length; i += 1) {
    dot[i] = Complex.ZERO;
    for (let ii = 0; ii < M[i].length; ii += 1) {
      dot[i] = add(dot[i], multiply(M[i][ii], x[ii]));
    }
  }

  return dot;
}

// https://towardsdatascience.com/fast-fourier-transform-937926e591cb
export function fft(x: Float32Array): Complex[] {
  return dft(x);
  // if (N % 2 > 0) {
  //   throw new Error('N must be a power of 2');
  // } else if (N <= 2) {

  // }
  
  
  
  
  // const N_min = Math.min(N, 2);

  // const n = [];
  // for (let i = 0; i < N_min; i += 1) {
  //   n[i] = i;
  // }
  // const k = [n];
  // const M: Complex[] = [];

  // for (let i = 0; i < )


  // return [];

  // for(let n = 0; n < N - 1; n += 1) {

  // }

  // const out: Complex[] = [];

  // for (let i = 0; i < n; i += 1) {
  //   out[i] = multiply(x[i], exp(multiply(new Complex(0, -1), 2 * Math.PI * i * i / x.length)));
  // }

  // return out;
}
