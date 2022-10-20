mod utils;

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
pub fn fft(x: Vec<f32>) -> Vec<f32> {
    utils::set_panic_hook();

    let mut planner = FftPlanner::new();
    let fft = planner.plan_fft_forward(x.len());

    let mut buffer: Vec<Complex<f32>> = x
        .iter()
        .map(|x| return Complex { re: *x, im: 0_f32 })
        .collect();

    fft.process(&mut buffer[..]);

    let mut ret: Vec<f32> = Vec::with_capacity(buffer.len() * 2);
    for num in buffer {
        ret.push(num.re.clone());
        ret.push(num.im.clone());
    }
    ret
}

#[wasm_bindgen]
pub fn ifft(x: Vec<f32>) -> Vec<f32> {
    utils::set_panic_hook();

    let mut planner = FftPlanner::new();
    let ifft = planner.plan_fft_inverse(x.len());

    let mut buffer: Vec<Complex<f32>> = x
        .iter()
        .map(|x| return Complex { re: *x, im: 0_f32 })
        .collect();

    ifft.process(&mut buffer[..]);

    let n = x.len() as f32;
    let mut ret: Vec<f32> = Vec::with_capacity(buffer.len() * 2);
    for num in buffer {
        ret.push(num.re.clone() / n);
        ret.push(num.im.clone() / n);
    }
    ret
}
