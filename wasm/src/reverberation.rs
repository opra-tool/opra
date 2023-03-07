use wasm_bindgen::prelude::wasm_bindgen;
use crate::linear_algebra::linear_function_steepness;

#[wasm_bindgen]
#[allow(dead_code)]
pub fn calculate_reverberation(squared_ir: Vec<f32>, fs: f32) -> Vec<f32> {
  let total_energy = squared_ir.iter().sum::<f32>();

  let cumulative_sum: Vec<f32> = squared_ir
    .into_iter()
    .scan(0.0, |acc, x| {
      *acc += x;
      Some(*acc)
    })
    .collect();

  let backward_integration: Vec<f32> = cumulative_sum
    .into_iter()
    .map(|x| (total_energy - x))
    .collect();

  let max_backward_integration = backward_integration.iter()
    .max_by(|a, b| a.partial_cmp(b).unwrap())
    .unwrap();

  let decay_curve = backward_integration
    .iter()
    .map(|val| 10.0 * (val / max_backward_integration).log10())
    .collect();

  return vec![extrapolate_curve(&decay_curve, -10.0, 0.0, fs), extrapolate_curve(&decay_curve, -25.0, -5.0, fs)];
}

fn extrapolate_curve(decay_curve: &Vec<f32>, min: f32, max: f32, fs: f32) -> f32 {
  let y_values: Vec<f32> = decay_curve
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

#[cfg(test)]
mod tests {
  use approx::{assert_relative_eq};
  use crate::reverberation::calculate_reverberation;

  #[test]
  #[allow(unused_must_use)]
  pub fn test() {
    let sample_rate = 1.0;
    // generate signal that drops to -60dB over about 20 seconds with a sample rate of 1
    let mut squared_ir = Vec::with_capacity(1000);
    squared_ir.push(1.0);
    for i in 1..25 {
      squared_ir.push(squared_ir[i - 1] / 2.0);
    }

    let reverb = calculate_reverberation(squared_ir, sample_rate);

    // edt should predict drop of 60dB at around 20 samples
    assert_relative_eq!(reverb[0], 20.0, epsilon=0.1);

    // T20 should predict drop of 60dB at around 20 samples
    assert_relative_eq!(reverb[1], 20.0, epsilon=0.1);
  }
}
