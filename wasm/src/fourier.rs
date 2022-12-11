use crate::utils;
use realfft::{num_complex::Complex, RealFftPlanner};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn fft_flat(values: Vec<f32>) -> Vec<f32> {
    utils::set_panic_hook();

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

fn complex_object_form_to_flat_form(object_form: Vec<Complex<f32>>) -> Vec<f32> {
    let mut flat_form: Vec<f32> = Vec::with_capacity(object_form.len() * 2);

    for num in object_form {
        flat_form.push(num.re.clone());
        flat_form.push(num.im.clone());
    }

    flat_form
}

fn complex_flat_form_to_object_form(flat_form: Vec<f32>) -> Vec<Complex<f32>> {
    let new_len = flat_form.len() / 2;
    let mut object_form: Vec<Complex<f32>> = Vec::with_capacity(new_len);

    for i in 0..new_len {
        object_form.push(Complex {
            re: flat_form[i * 2],
            im: flat_form[i * 2 + 1],
        })
    }

    object_form
}

#[cfg(test)]
mod tests {
    use rustfft::num_complex::Complex;

    use crate::fourier::*;

    #[test]
    fn converts_complex_object_form_into_flat_form() {
        let object_form = vec![
            Complex { re: 1.0, im: 2.0 },
            Complex { re: 2.0, im: 3.0 },
            Complex { re: 4.0, im: 5.0 },
        ];

        let flat_form = complex_object_form_to_flat_form(object_form);

        assert_eq!(flat_form, vec![1.0, 2.0, 2.0, 3.0, 4.0, 5.0]);
    }

    #[test]
    fn converts_complex_flat_form_into_object_form() {
        let flat_form = vec![1.0, 2.0, 2.0, 3.0, 4.0, 5.0];

        let object_form = complex_flat_form_to_object_form(flat_form);

        assert_eq!(
            object_form,
            vec![
                Complex { re: 1.0, im: 2.0 },
                Complex { re: 2.0, im: 3.0 },
                Complex { re: 4.0, im: 5.0 },
            ]
        );
    }
}
