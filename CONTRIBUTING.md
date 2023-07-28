# Contribute Code to the project

## Tooling

Most tooling configuration is in the [package.json](./package.json) file to reduce the amount of config files in the project.

### Development Setup

```sh
# requires rust, cargo and wasm-pack
cd wasm
wasm-pack build --target web

# requires node 10 & npm 6 or higher
npm install
npm run start
```

### Linting & Testing

```
npm run lint
npm run test
```

When working on tests, a watch mode can be used to automatically rerun changed tests.

```
npm run test:watch
```


### Building for production

The following command builds a production bundle and places it in the `dist/` directory.

```
npm run build
```

### Commits

This repository uses [conventional commits](https://www.conventionalcommits.org).

### CI

A [Github Actions workflow](.github/workflows/ci.yml) deploys to Github Pages.

### Localization

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

Built files are stored in `src/localization/`

## Defining acoustical params

Acoustical params are defined in two parts.
First, a definition used for presentation to the user has to be put in `acoustical-param-definition/`, see this directory for example params.
It also has to be added to the list in `main.ts` if it is to be displayed to the user.
Params not included in this list will still be calculated and included in exports.

Param groups are used to render graphs containing multiple different params.
All params in a group need to be of the same unit.
Membership in a group has no effect on param calculation.

Second, an implementation for the parameter's calculation has to be put in `acoustical-param-analyzing/param-implementation`.
A param definition requires a `forType` attribute, which can be `omnidirectional`, `binaural` or `mid-side`.
The analyzing logic then makes sure to supply the calculation function(s) with the appropriate octave bands.
A `omnidirectional` param will thus receive single-channel octave bands, while params of the other types will receive dual-channel octave bands.

**NOTE:** currently, `omnidirectional` and `mid-side` will receive **squared** octave bands, while `binaural` will receive **non-squared** octave bands. This is subject to change in the future for consistency.

A parameter implementation has to be added to the `ALL_PARAMS` list in `acoustical-param-analyzing/params.ts` to be picked up by the application.
If the parameter implementation depends on environment parameters like temperature or humidity, it additionally has to be added to the `ENVIRONMENT_DEPENDENT_PARAMS` list. 

Params can use other params as a basis for their calculation.
Lookup functions for single-figure and octave band results are passed into the calculation functions.
These accept a param ID and throw an error when no result is found.
The analyzing logic guarantees, that no old results are read, for example from before an environment values update.

**NOTE:** params, which depend on others, need to be listed **after** these params, otherwise the requested result will not be available, yet


## Architecture

Some thought has been put into an architecture, which are outlined in this section.
It is by no means finalized and will evolve while the application growths. 
Some directories and files are listed here along with their purpose:

- `app-logic.ts` - in lack of a better name - is the primary coordinator of all (non-UI) functionality.
- `acoustical-param-analyzing/` holds code to (re-)calculate parameters for impulse response files.
- `acoustical-param-definition/` Holds definitions of acoustical parameters - and groups thereof - shown to users of the application. A Definition consists of a human-readable parameter name and description, the associated formula implementation is found in `acoustical-param-analyzing/` ([learn more](#defining-acoustical-params)).
- `transfer-objects/` defines data objects used across the application, such as an `ImpulseResponseFile`. These generally hold little logic and can be imported freely from any other file.
- `ui/components` contains reusable, not strictly application-specific web components, like a card or file drop component.
- `ui/app-ui.ts` coordinates the UI logic in the application. It passes data to the app logic and updates the interface based on received events.

*(all paths are relative to `src/`)*

Generally, it was tried to separate presentation logic from the analyzing logic.

### Import recommendations

To limit 'sphagetthification' of application code, some thought needs to be put into which files import from where.
This is by no means a rulebook or exhaustive list, but rather recommendations which need to be reevaluated continuously.

Files in `acoustical-params/` should not import any logic from the rest of the application apart from helpers like `math/` or `transfer-objects/`.

Files in `acoustical-param-analyzing/` should not import code outside of previously mentioned helpers.

Files in `localization/` should not import other modules apart from helpers.

Files in `transfer-objects/` should not import other modules apart from helpers.

Web components should generally receive inputs via their `@property()` fields. An exception to this rule is `ui/app-ui.ts`.

The WebAssembly code has no limitations for importing, it is currently treated similar to an external dependency.
