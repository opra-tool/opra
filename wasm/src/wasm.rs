use rustfft::num_complex::Complex;

pub fn complex_object_form_to_flat_form(object_form: Vec<Complex<f32>>) -> Vec<f32> {
    let mut flat_form: Vec<f32> = Vec::with_capacity(object_form.len() * 2);

    for num in object_form {
        flat_form.push(num.re.clone());
        flat_form.push(num.im.clone());
    }

    flat_form
}

pub fn complex_flat_form_to_object_form(flat_form: Vec<f32>) -> Vec<Complex<f32>> {
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

    use crate::wasm::*;

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
