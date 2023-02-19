use wasm_bindgen::prelude::wasm_bindgen;
use crate::linear_algebra::linear_function_steepness;

#[wasm_bindgen]
pub fn calculate_reverberation(squared_ir: Vec<f32>, tc: f32, fs: f32) -> Vec<f32> {
  let sum = squared_ir.iter().sum::<f32>();
  let cumulative_sum: Vec<f32> = squared_ir
    .into_iter()
    .scan(0.0, |acc, x| {
      *acc += x;
      Some(*acc)
    })
    .collect();

  let si1: Vec<f32> = cumulative_sum
    .into_iter()
    .map(|x| (sum - x))
    .collect();

  let max_si1 = si1.iter()
    .max_by(|a, b| a.partial_cmp(b).unwrap())
    .unwrap();

  let ec = si1
    .iter()
    .map(|val| 10.0 * (val / max_si1).log10())
    .collect();

  return vec![calc(&ec, -10.0, 0.0, fs), calc(&ec, -(5.0 + tc), -5.0, fs)];
}

fn calc(ec: &Vec<f32>, min: f32, max: f32, fs: f32) -> f32 {
  let y_values: Vec<f32> = ec
    .iter()
    .filter(|val| (**val > min && **val < max))
    .map(|x| *x)
    .collect();

  let x_values = y_values
    .iter()
    .enumerate()
    .map(|(i, _val)| (1.0 / fs) * (i + 1) as f32)
    .collect();

  return 60.0 / linear_function_steepness(&x_values, &y_values).abs();
}
