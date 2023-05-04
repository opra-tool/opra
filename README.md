## RAQI Online Toolbox

![CI](https://github.com/paulschwoerer/raqi-online-toolbox/actions/workflows/ci.yml/badge.svg)

This application calculates acoustical parameters from room impulse responses, primarily from ISO 3382-1[^1], Soulodre & Bradley[^2] and L.L. Beranek[^3].
It is in parts based on an earlier implemented Matlab tool[^4].
The accompanying masters thesis goes into detail about calculation methods used in this application[^5].

Both tools were programmed at the [Institute of Sound and Vibration Engineering​ (ISAVE)](https://isave.hs-duesseldorf.de/), which is part of the [Hochschule Düsseldorf](https://hs-duesseldorf.de/).

[^1]: ISO 3382-1. (2009). *Acoustics – Measurement of roomacoustic parameters – Part1: Performance Spaces*
[^2]: Soulodre, G. A., & Bradley, J. S. (1995). *Subjective evaluation of new room acoustic measures*
[^3]: Beranek, L. L. (1962). *Concert Halls and Opera Houses Music, Acoustics, and Architecture*
[^4]: Prinz, L. J. (2021). *Entwicklung eines Werkzeugs für dieAuswertung von Impulsantworten zur Untersuchung raumakustischer Qualität*
[^5]: Schwörer, P. (2023). *A web-based toolbox for analyzing acoustic room impulse responses*

## Staging Environment

A staging environment reflecting the current state of the `main` branch is availabe at [raqi-staging.paulschwoerer.de](https://raqi-staging.paulschwoerer.de/).

## Test files

A large collection of room impulse responses can be at [github.com/RoyJames/room-impulse-responses](https://github.com/RoyJames/room-impulse-responses).

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

## Localization

Localization is implemented using [lit-localize](https://lit.dev/docs/localization/overview/).
To extract strings needing localization, run

```shell
./node_modules/.bin/lit-localize extract
```

Then edit `xliff/[lang].xlf` until you're happy with the results.
To include translations back into the application, run

```shell
./node_modules/.bin/lit-localize build
```

## Tooling configs

For most of the tools, the configuration is in the `package.json` to reduce the amount of files in the project.
