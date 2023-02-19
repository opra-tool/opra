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

  let mut max_si1 = 0.0;
  let mut si1 = Vec::with_capacity(cumulative_sum.len());
  for val in cumulative_sum {
    let next_val = sum - val;
    si1.push(next_val);

    max_si1 = next_val.max(max_si1);
  }

  let mut ec = Vec::with_capacity(si1.len());
  for val in si1 {
    ec.push(10.0 * (val / max_si1).log10())
  }

  return vec![calc(&ec, -10.0, 0.0, fs), calc(&ec, -(5.0 + tc), -5.0, fs)];
}

fn calc(ec: &Vec<f32>, min: f32, max: f32, fs: f32) -> f32 {
  let mut trimmed = vec![];
  for val in ec {
    if *val > min && *val < max {
      trimmed.push(*val);
    }
  }

  let mut tseg = Vec::with_capacity(trimmed.len());
  for i in 0..trimmed.len() {
    tseg.push((1.0 / fs) * (i + 1) as f32);
  }

  return 60.0 / linear_function_steepness(&tseg, &trimmed).abs();
}
