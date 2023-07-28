import { iacc as wasmIacc } from 'opra-wasm-module';
import { e80Calc } from '../early-late-fractions';
import { createOctaveBandParameterImplementation } from '../param-implementation';

export const IACC = createOctaveBandParameterImplementation(
  'iacc',
  'binaural',
  bands =>
    bands.collect(band => wasmIacc(band.getChannel(0), band.getChannel(1))),
  octaveBandValues =>
    (octaveBandValues.band(125) +
      octaveBandValues.band(250) +
      octaveBandValues.band(500) +
      octaveBandValues.band(1000) +
      octaveBandValues.band(2000) +
      octaveBandValues.band(4000)) /
    6
);

export const EARLY_IACC = createOctaveBandParameterImplementation(
  'eiacc',
  'binaural',
  bands =>
    bands.collect(band => {
      const e80 = e80Calc(band);

      return wasmIacc(e80.getChannel(0), e80.getChannel(1));
    }),
  octaveBandValues =>
    (octaveBandValues.band(125) +
      octaveBandValues.band(250) +
      octaveBandValues.band(500) +
      octaveBandValues.band(1000) +
      octaveBandValues.band(2000) +
      octaveBandValues.band(4000)) /
    6
);
