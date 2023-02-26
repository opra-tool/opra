/// Fits a linear function a + bx according to the least-squares algorithm and returns its steepness b.
/// https://mathworld.wolfram.com/LeastSquaresFitting.html
///
/// # Arguments
///
/// * `x`: x-values of input points
/// * `y`: y-values of input points
///
/// returns: f32 - the steepness b
///
pub fn linear_function_steepness(x: &Vec<f32>, y: &Vec<f32>) -> f32 {
  if x.len() != y.len() {
    panic!("expected matching counts x- and y-values")
  }

  let mean_x = x.iter().sum::<f32>() / (x.len() as f32);
  let mean_y = y.iter().sum::<f32>() / (y.len() as f32);

  let mut sum_of_squares_xx = 0.0;
  let mut sum_of_squares_xy = 0.0;
  for i in 0..x.len() {
    sum_of_squares_xx += (x[i] - mean_x).powf(2.0);
    sum_of_squares_xy += (x[i] - mean_x) * (y[i] - mean_y);
  }

  return sum_of_squares_xy / sum_of_squares_xx;
}

#[cfg(test)]
mod tests {
  use crate::linear_algebra::*;

  #[test]
  fn returns_steepness_of_a_fitted_linear_function() {
    let x1 = vec![1.0, 2.0];
    let y1 = vec![1.0, 2.0];

    let x2 = vec![1.0, 2.0, 3.0];
    let y2 = vec![1.0, 10.0, 4.0];

    let x3 = vec![1.0, 2.0, 3.0, 4.0];
    let y3 = vec![1.0, -10.0, -10.0, 1.0];

    let x4 = vec![1.0, 1.2, 1.5, 2.0, 2.3, 2.5, 2.7, 3.0, 3.1, 3.2, 3.6];
    let y4 = vec![1.5, 2.0, 3.0, 1.8, 2.7, 4.7, 7.1, 10.0, 6.0, 5.0, 8.9];

    let x5 = vec![1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0];
    let y5 = vec![2.0, -4.0, 8.0, 1.0, 9.0, 4.0, 5.0, 2.0, 0.0];

    assert_eq!(linear_function_steepness(&x1, &y1), 1.0);
    assert_eq!(linear_function_steepness(&x2, &y2), 1.5);
    assert_eq!(linear_function_steepness(&x3, &y3), 0.0);
    assert_eq!((10.0 * linear_function_steepness(&x4, &y4)).round() / 10.0, 2.8);
    assert_eq!((10.0 * linear_function_steepness(&x5, &y5)).round() / 10.0, 0.1);
  }
}
