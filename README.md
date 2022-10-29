## RAQI Online Toolbox

![CI](https://github.com/paulschwoerer/raqi-online-toolbox/actions/workflows/ci.yml/badge.svg)

## Staging Environment

A staging environment reflecting the current state of the `main` branch is availabe [here](https://raqi-staging.paulschwoerer.de/).

## Test files

A large collection of room impulse responses can be found [here](https://github.com/RoyJames/room-impulse-responses).

## Development Quickstart

To get started:

```sh
# requires rust, cargo and wasm-pack
cd wasm
wasm-pack build --target web

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

## Remarks

* The code uses double precision floating point numbers, as it is based on matlab code and matlab [uses doubles by default](https://de.mathworks.com/help/matlab/matlab_prog/floating-point-numbers.html).
* Strange results have been observed when using `reduce()` to sum arrays. It is advised to use a for loop instead.
