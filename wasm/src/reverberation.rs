use wasm_bindgen::prelude::wasm_bindgen;

#[wasm_bindgen]
pub fn calculate_reverberation(squared_ir: Vec<f32>, tc: f64, fs: f64) -> Vec<f64> {
  let sum = squared_ir.iter().sum::<f32>() as f64;
  let cumulative_sum: Vec<f64> = squared_ir
    .into_iter()
    .scan(0.0, |acc, x| {
      *acc += x as f64;
      Some(*acc)
    })
    .collect();

  let mut max_si1 = 0.0;
  let mut si1 = Vec::with_capacity(cumulative_sum.len());
  for val in cumulative_sum {
    let si1_val = sum - val;

    if si1_val > max_si1 {
      max_si1 = si1_val;
    }

    si1.push(si1_val);
  }

  let mut ec = Vec::with_capacity(si1.len());
  for val in si1 {
    ec.push(10.0 * (val / max_si1).log10())
  }

  return vec![calc(&ec, -10.0, 0.0, fs), calc(&ec, -(5.0 + tc), -5.0, fs)];
}

fn calc(ec: &Vec<f64>, min: f64, max: f64, fs: f64) -> f64 {
  let mut trimmed = vec![];
  for val in ec {
    if *val > min && *val < max {
      trimmed.push(*val);
    }
  }

  let mut tseg = Vec::with_capacity(trimmed.len());
  for i in 0..trimmed.len() {
    tseg.push((1.0 / fs) * (i + 1) as f64);
  }

  return 60.0 / fit_linear_function(&tseg, &trimmed).abs();
}

fn fit_linear_function(x: &Vec<f64>, y: &Vec<f64>) -> f64 {
  if x.len() != y.len() {
    panic!("expected matching counts x- and y-values")
  }

  let mut sum_x = 0.0;
  let mut sum_y = 0.0;
  for i in 0..x.len() {
    sum_x += x[i];
    sum_y += y[i];
  }

  let avg_x = sum_x / (x.len() as f64);
  let avg_y = sum_y / (y.len() as f64);

  let mut sum1 = 0.0;
  let mut sum2 = 0.0;
  for i in 0..x.len() {
    sum1 += (x[i] - avg_x) * (y[i] - avg_y);
    sum2 += (x[i] - avg_x).powf(2.0);
  }

  return sum1 / sum2;
}

#[cfg(test)]
mod tests {
  use crate::reverberation::*;

  #[test]
  fn fits_a_linear_function_to_points_and_returns_its_steepness() {
    let x1 = vec![1.0, 2.0];
    let y1 = vec![1.0, 2.0];

    let x2 = vec![1.0, 2.0, 3.0];
    let y2 = vec![1.0, 10.0, 4.0];

    let x3 = vec![1.0, 2.0, 3.0, 4.0];
    let y3 = vec![1.0, -10.0, -10.0, 1.0];

    let x4 = vec![1.0, 1.2, 1.5, 2.0, 2.3, 2.5, 2.7, 3.0, 3.1, 3.2, 3.6];
    let y4 = vec![1.5, 2.0, 3.0, 1.8, 2.7, 4.7, 7.1, 10.0, 6.0, 5.0, 8.9];

    assert_eq!(fit_linear_function(&x1, &y1), 1.0);
    assert_eq!(fit_linear_function(&x2, &y2), 1.5);
    assert_eq!(fit_linear_function(&x3, &y3), 0.0);
    assert_eq!((10.0 * fit_linear_function(&x4, &y4)).round() / 10.0, 2.8);
  }
}
