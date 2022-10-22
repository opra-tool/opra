mod utils;

use std::usize;

use rustfft::{num_complex::Complex, FftPlanner};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

macro_rules! console_log {
    // Note that this is using the `log` function imported above during
    // `bare_bones`
    ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}

#[wasm_bindgen]
pub fn xcorr(a: Vec<f32>, b: Vec<f32>, n: usize) -> Vec<f32> {
    utils::set_panic_hook();
    // TODO: if lists are not equal length, panic
    // this is implemented in JS, move here?

    let mut a_padded = vec![Complex { re: 0.0, im: 0.0 }; n];
    let mut b_padded = vec![Complex { re: 0.0, im: 0.0 }; n];

    for (i, val) in a.iter().enumerate() {
        a_padded[i] = Complex { re: *val, im: 0.0 };
    }
    for (i, val) in b.iter().enumerate() {
        b_padded[i] = Complex { re: *val, im: 0.0 };
    }

    let a_fft = fft(a_padded);
    let b_fft = fft(b_padded);
    let mut b_fft_conj = Vec::with_capacity(b_fft.len());
    for val in b_fft {
        b_fft_conj.push(val.conj());
    }

    let mut multiplied = Vec::with_capacity(b_fft_conj.len());
    for (i, _) in a_fft.iter().enumerate() {
        multiplied.push(a_fft[i] * b_fft_conj[i]);
    }
    let ifft = ifft(multiplied);

    let mut real = Vec::with_capacity(ifft.len());
    for val in ifft {
        real.push(val.re);
    }

    let mxl = a.len() - 1;
    return [&real[n - mxl..mxl + n - mxl], &real[0..mxl + 1]].concat();
}

pub fn fft(mut x: Vec<Complex<f32>>) -> Vec<Complex<f32>> {
    let mut planner = FftPlanner::new();
    let fft = planner.plan_fft_forward(x.len());

    fft.process(&mut x[..]);

    x
}

pub fn ifft(mut x: Vec<Complex<f32>>) -> Vec<Complex<f32>> {
    let mut planner = FftPlanner::new();
    let ifft = planner.plan_fft_inverse(x.len());

    ifft.process(&mut x[..]);

    // normalize
    return x.iter().map(|val| val / x.len() as f32).collect();
}
