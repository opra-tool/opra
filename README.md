## RAQI Online Toolbox

![Deploy to GH Pages](https://github.com/paulschwoerer/raqi-online-toolbox/actions/workflows/deploy.yml/badge.svg)

## Staging Environment

A staging environment reflecting the current state of the `main` branch is availabe [here](https://paulschwoerer.github.io/raqi-online-toolbox/).

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