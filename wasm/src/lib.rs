mod utils;
mod wasm;
mod iacc;

use realfft::{RealFftPlanner, num_complex::Complex};
use wasm::*;
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

    /*let buffer: Vec<Complex<f32>> = values
        .iter()
        .map(|x| return Complex { re: *x, im: 0.0 })
        .collect();*/

    let out = fft(values);

    return complex_object_form_to_flat_form(out);
}

pub fn fft(mut x: Vec<f32>) -> Vec<Complex<f32>> {
    let mut planner = RealFftPlanner::<f32>::new();
    let fft = planner.plan_fft_forward(x.len());

    let mut out = fft.make_output_vec();

    fft.process(&mut x, &mut out).unwrap();

    return out;
}

#[wasm_bindgen]
pub fn ifft_flat(flat_input: Vec<f32>, length: usize) -> Vec<f32> {
    utils::set_panic_hook();

    let input = complex_flat_form_to_object_form(flat_input);

    return ifft(input, length);
}

pub fn ifft(mut input: Vec<Complex<f32>>, length: usize) -> Vec<f32> {
    let mut planner = RealFftPlanner::<f32>::new();
    let ifft = planner.plan_fft_inverse(length);
    let mut out = ifft.make_output_vec();

    ifft.process(&mut input, &mut out).unwrap();

    // normalize
    return out.iter().map(|val| val / length as f32).collect();
}
