## RAQI Online Toolbox

![CI](https://github.com/paulschwoerer/raqi-online-toolbox/actions/workflows/ci.yml/badge.svg)

## Staging Environment

A staging environment reflecting the current state of the `main` branch is availabe [here](https://raqi-staging.paulschwoerer.de/).

## Development Quickstart

To get started:

```sh
# requires node 10 & npm 6 or higher
npm install
npm run start
```

## Scripts

- `start` runs the app for development, reloading on file changes
- `start:build` runs the app after it has been built using the build command
- `build` builds the app and outputs it in the `dist` directory
- `test` runs the test suite with Web Test Runner
- `lint` runs the linter for the project

## Tooling configs

For most of the tools, the configuration is in the `package.json` to reduce the amount of files in the project.

## Web Assembly

### Math support

Both Golang and Rust have complex numbers support by default:
* https://rust-lang-nursery.github.io/rust-cookbook/science/mathematics/complex_numbers.html
* https://pkg.go.dev/math/cmplx

Rust has some form of matrix math support [built-in](https://rust-lang-nursery.github.io/rust-cookbook/science/mathematics/linear_algebra.html).
In Golang there is [mat](https://pkg.go.dev/gonum.org/v1/gonum/mat) and https://github.com/oelmekki/matrix.

Availability of other needed low-level functions:

| Function          | Rust                  | Golang                                            |
| ----------------- | --------------------- | ------------------------------------------------- |
| fft()             | crate:fourier,rustfft | go-dsp                                            |
| ifft()            | crate:fourier,rustfft | go-dsp                                            |
| freqz()           | crate:fundsp?         | -                                                 |
| polyval()         | crate:polynomials     | github.com/getamis/alice@v1.0.1/crypto/polynomial |
| xcorr()           | crate:basic_dsp       | https://gist.github.com/bemasher/7657285          |
| weightingFilter() | -                     | -                                                 |
| polyfit()         | crate:polyfit-rs      | github.com/openacid/slimarray/polyfit             |

### Interfacing with Javascript

Golang needs glue code, building from golang to wasm is easy.
Rust wasm libraries are importable ust like an ES6 module.


## Remarks

* The code uses double precision floating point numbers, as it is based on matlab code and matlab [uses doubles by default](https://de.mathworks.com/help/matlab/matlab_prog/floating-point-numbers.html).
