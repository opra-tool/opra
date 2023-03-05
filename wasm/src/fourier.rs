use realfft::{num_complex::Complex, RealFftPlanner};

pub fn fft(mut x: Vec<f32>) -> Vec<Complex<f32>> {
    let mut planner = RealFftPlanner::<f32>::new();
    let fft = planner.plan_fft_forward(x.len());

    let mut out = fft.make_output_vec();

    fft.process(&mut x, &mut out).unwrap();

    return out;
}

pub fn ifft(mut input: Vec<Complex<f32>>, length: usize) -> Vec<f32> {
    let mut planner = RealFftPlanner::<f32>::new();
    let ifft = planner.plan_fft_inverse(length);
    let mut out = ifft.make_output_vec();

    ifft.process(&mut input, &mut out).unwrap();

    // normalize
    return out.iter().map(|val| val / length as f32).collect();
}
