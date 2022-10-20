mod utils;

use rand::prelude::*;
use rand::{distributions::Standard, Rng};
use rustfft::{num_complex::Complex, FftPlanner};
use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);

    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
    #[wasm_bindgen(js_namespace = console, js_name = log)]
    fn log_u32(a: u32);
}

macro_rules! console_log {
    // Note that this is using the `log` function imported above during
    // `bare_bones`
    ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}

// TODO: return type and conversion to js complex numbers
#[wasm_bindgen]
pub fn fft() {
    //-> Vec<Complex<f64>> {
    utils::set_panic_hook();
    let rng = SmallRng::seed_from_u64(0);

    let values: Vec<f64> = rng.sample_iter(Standard).take(20).collect();

    console_log!("values {:?}", values);

    let mut planner = FftPlanner::new();
    let fft = planner.plan_fft_forward(20);

    let mut buffer: Vec<Complex<f64>> = values
        .iter()
        .map(|x| return Complex { re: *x, im: 0_f64 })
        .collect();

    fft.process(&mut buffer[..]);

    log_u32(42);

    console_log!("buffer {:?}", buffer);
}
