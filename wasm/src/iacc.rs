mod iacc {
  use rustfft::num_complex::Complex;
  use wasm_bindgen::prelude::wasm_bindgen;
  use crate::{fft, ifft, utils};

  #[wasm_bindgen]
  pub fn iacc(left_channel: Vec<f32>, right_channel: Vec<f32>) -> f32 {
    utils::set_panic_hook();

    if left_channel.len() != right_channel.len() {
      panic!("expected left channel and right channel to have the same length")
    }

    let mut left_sum = 0.0;
    let mut right_sum = 0.0;
    for i in 0..left_channel.len() {
      // TODO: using f32 produced slight floating point errors, find explanation
      left_sum += (left_channel[i] as f64).powf(2.0);
      right_sum += (right_channel[i] as f64).powf(2.0);
    }


    let transform_length = find_transform_length(left_channel.len());
    let correlated = x_correlate(left_channel, right_channel, transform_length);

    let root = (left_sum * right_sum).sqrt() as f32;
    let mut max_val = 0.0;
    for val in correlated {
      if val / root > max_val {
        max_val = val / root;
      }
    }

    return max_val;
  }

  fn find_transform_length(m: usize) -> usize {
    let mut m2 = m * 2;

    loop {
      let mut r = m2;
      for p in vec![2, 3, 5, 7] {
        while r > 1 && r % p == 0 {
          r /= p;
        }
      }

      if r == 1 {
        break;
      }
      m2 += 1;
    }

    return m2;
  }

  fn x_correlate(a: Vec<f32>, b: Vec<f32>, n: usize) -> Vec<f32> {
    let mut a_padded = vec![Complex { re: 0.0, im: 0.0 }; n];
    let mut b_padded = vec![Complex { re: 0.0, im: 0.0 }; n];

    for i in 0..a.len() {
      a_padded[i] = Complex { re: a[i], im: 0.0 };
      b_padded[i] = Complex { re: b[i], im: 0.0 };
    }

    let a_fft = fft(a_padded);
    let b_fft = fft(b_padded);

    let mut multiplied = Vec::with_capacity(a_fft.len());
    for (i, _) in a_fft.iter().enumerate() {
      multiplied.push(a_fft[i] * b_fft[i].conj());
    }
    let ifft = ifft(multiplied);

    let mut real = Vec::with_capacity(ifft.len());
    for val in ifft {
      real.push(val.re);
    }

    let mxl = a.len() - 1;
    return [&real[n - mxl..mxl + n - mxl], &real[0..mxl + 1]].concat();
  }
}

#[cfg(test)]
mod tests {
  use crate::iacc::*;

  #[test]
  #[should_panic]
  fn panics_when_given_channels_of_unequal_lengths() {
    let _ = iacc::iacc(vec![1.0], vec![1.0, 2.0]);
  }
}