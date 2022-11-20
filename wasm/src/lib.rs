mod utils;
mod wasm;
mod iacc;

use std::usize;

use wasm::*;

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
pub fn fft_flat(values: Vec<f32>) -> Vec<f32> {
    utils::set_panic_hook();

    let buffer: Vec<Complex<f32>> = values
        .iter()
        .map(|x| return Complex { re: *x, im: 0.0 })
        .collect();

    let out = fft(buffer);

    return complex_object_form_to_flat_form(out);
}

pub fn fft(mut x: Vec<Complex<f32>>) -> Vec<Complex<f32>> {
    let mut planner = FftPlanner::new();
    let fft = planner.plan_fft_forward(x.len());

    fft.process(&mut x[..]);

    return x;
}

#[wasm_bindgen]
pub fn ifft_flat(flat_input: Vec<f32>) -> Vec<f32> {
    utils::set_panic_hook();

    let input = complex_flat_form_to_object_form(flat_input);

    let out = ifft(input);

    return complex_object_form_to_flat_form(out);
}

pub fn ifft(mut x: Vec<Complex<f32>>) -> Vec<Complex<f32>> {
    let mut planner = FftPlanner::new();
    let ifft = planner.plan_fft_inverse(x.len());

    ifft.process(&mut x[..]);

    // normalize
    return x.iter().map(|val| val / x.len() as f32).collect();
}
